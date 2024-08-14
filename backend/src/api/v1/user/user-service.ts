import status from "http-status";

import { type UserMedia, type Tag, userModel } from "./user-model.js";
import { AppError } from "../../../app-error.js";

export async function getMediasByTagIds(
  userId: string,
  tagIds: number[]
): Promise<UserMedia[]> {
  const user = await userModel
    .findOne(
      { _id: userId },
      {
        medias: {
          $filter: {
            input: "$medias",
            as: "media",
            cond: {
              $setIsSubset: [tagIds, "$$media.tags"],
            },
          },
        },
      }
    )
    .exec();

  if (user == null) {
    throw new AppError(status.BAD_REQUEST, "Could not get medias by tag ids");
  }

  return user?.medias;
}

export async function getMediaData(
  userId: string,
  mediaId: number
): Promise<UserMedia | undefined> {
  const user = await userModel
    .findOne({ _id: userId, "medias.mediaId": mediaId }, { "medias.$": 1 })
    .exec();
  return user?.medias[0];
}

export async function updateMediaData(
  userId: string,
  mediaId: number,
  type: "tv" | "movie",
  tags: Array<[number, boolean]>,
  watchedEpisodes: Array<[number, boolean]>
): Promise<void> {
  const tagsToAdd = tags.filter(([_, add]) => add).map(([id, _]) => id);
  const tagsToRemove = tags.filter(([_, add]) => !add).map(([id, _]) => id);

  const episodesToAdd = watchedEpisodes.filter(([_, add]) => add).map(([id, _]) => id);
  const episodesToRemove = watchedEpisodes.filter(([_, add]) => !add).map(([id, _]) => id);

  const bulkOps = [];

  bulkOps.push({
    updateOne: {
      filter: {
        _id: userId,
        "medias.mediaId": { $ne: mediaId },
      },
      update: {
        $push: {
          medias: {
            mediaId,
            type,
            tags: [],
            watchedEpisodes: [],
          },
        },
      },
    },
  });

  if (tagsToAdd.length > 0) {
    bulkOps.push({
      updateOne: {
        filter: {
          _id: userId,
          "medias.mediaId": mediaId,
        },
        update: {
          $addToSet: { "medias.$.tags": { $each: tagsToAdd } },
        },
      },
    });
  }

  if (tagsToRemove.length > 0) {
    bulkOps.push({
      updateOne: {
        filter: {
          _id: userId,
          "medias.mediaId": mediaId,
        },
        update: {
          $pull: { "medias.$.tags": { $in: tagsToRemove } },
        },
      },
    });
  }

  if (episodesToAdd.length > 0) {
    bulkOps.push({
      updateOne: {
        filter: {
          _id: userId,
          "medias.mediaId": mediaId,
        },
        update: {
          $addToSet: { "medias.$.watchedEpisodes": { $each: episodesToAdd } },
        },
      },
    });
  }

  if (episodesToRemove.length > 0) {
    bulkOps.push({
      updateOne: {
        filter: {
          _id: userId,
          "medias.mediaId": mediaId,
        },
        update: {
          $pull: { "medias.$.watchedEpisodes": { $in: episodesToRemove } },
        },
      },
    });
  }

  bulkOps.push({
    updateOne: {
      filter: {
        _id: userId,
        "medias.mediaId": mediaId,
        "medias.tags": { $size: 0 },
        "medias.watchedEpisodes": { $size: 0 },
      },
      update: {
        $pull: {
          medias: { mediaId },
        },
      },
    },
  });

  const result = await userModel.bulkWrite(bulkOps);
  if (!result.isOk()) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to update user data"
    );
  }
}

export async function getAllTags(userId: string): Promise<Tag[]> {
  const user = await userModel.findById(userId).select("tags").exec();
  if (user == null) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to get user tags");
  }
  return user.tags;
}

export async function createTag(userId: string, name: string): Promise<number> {
  const tags = await getAllTags(userId);
  if (tags.length >= 20) {
    throw new AppError(status.BAD_REQUEST, "Can not create more tags");
  }

  const tagId = (tags[tags.length - 1]?.tagId ?? -1) + 1;
  const result = await userModel.updateOne(
    { _id: userId, "tags.tagId": { $ne: tagId }, "tags.name": { $ne: name } },
    { $push: { tags: { tagId, name } } }
  );

  if (result.modifiedCount === 0) {
    throw new AppError(status.BAD_REQUEST, "Could not create tag");
  }

  return tagId;
}

export async function deleteTag(userId: string, name: string): Promise<void> {
  const user = await userModel.findOne(
    { _id: userId, "tags.name": name },
    { "tags.$": 1 }
  );

  if (user == null || user.tags.length === 0 || user.tags[0] == null) {
    throw new AppError(status.BAD_REQUEST, "Tag is not found");
  }

  const bulkOps = [];
  const tagId = user.tags[0].tagId;

  bulkOps.push({
    updateOne: {
      filter: { _id: userId },
      update: { $pull: { tags: { tagId } } },
    },
  });

  bulkOps.push({
    updateMany: {
      filter: { _id: userId, "medias.tags": tagId },
      update: { $pull: { "medias.$[media].tags": tagId } },
      arrayFilters: [{ "media.tags": tagId }],
    },
  });

  bulkOps.push({
    updateMany: {
      filter: {
        _id: userId,
        "medias.tags": { $size: 0 },
        "medias.watchedEpisodes": { $size: 0 },
      },
      update: {
        $pull: {
          medias: {
            tags: { $size: 0 },
            watchedEpisodes: { $size: 0 },
          },
        },
      },
    },
  });

  const result = await userModel.bulkWrite(bulkOps);
  if (!result.isOk()) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to delete tag");
  }
}
