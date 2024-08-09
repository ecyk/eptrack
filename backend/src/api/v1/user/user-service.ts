import status from "http-status";

import { AppError } from "../../../app-error.js";
import { userModel } from "../auth/auth-model.js";

export async function getUserMediaData(
  userId: string,
  mediaId: number
): Promise<number[]> {
  const userMedia = await userModel
    .findOne({ _id: userId, "medias.mediaId": mediaId }, { "medias.$": 1 })
    .exec();
  return userMedia?.medias[0]?.episodes ?? [];
}

export async function updateUserMediaData(
  userId: string,
  mediaId: number,
  data: Array<[number, boolean]>
): Promise<void> {
  const episodesToAdd = data.filter(([_, watched]) => watched).map(([episode, _]) => episode);
  const episodesToRemove = data.filter(([_, watched]) => !watched).map(([episode, _]) => episode);

  // TODO(ecyk): Check if ids are correct from redis

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
            episodes: [],
            tags: [],
          },
        },
      },
    },
  });

  bulkOps.push({
    updateOne: {
      filter: {
        _id: userId,
        "medias.mediaId": mediaId,
      },
      update: {
        $addToSet: { "medias.$.episodes": { $each: episodesToAdd } },
      },
    },
  });

  bulkOps.push({
    updateOne: {
      filter: {
        _id: userId,
        "medias.mediaId": mediaId,
      },
      update: {
        $pull: { "medias.$.episodes": { $in: episodesToRemove } },
      },
    },
  });

  bulkOps.push({
    updateOne: {
      filter: {
        _id: userId,
        "medias.mediaId": mediaId,
        "medias.episodes": { $size: 0 },
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
