import * as cornerstone from 'cornerstone-core';

const distances = {};

function getImagePositionPatient (imageId) {
  const imagePlane = cornerstone.metaData.get('imagePlane', imageId);

  if (!imagePlane) {
    throw new Error(`getImagePosition: Image plane is not available for imageId: ${imageId}`);
  }

  if (!imagePlane.imagePositionPatient) {
    throw new Error(`getImagePosition: Image position patient is not available for imageId: ${imageId}`);
  }

  return imagePlane.imagePositionPatient;
}

export default function getDistanceBetweenImagePositions (imageId1, imageId2) {
  // Check if we have already calculated this distance

  // TODO: There is probably a smarter way to store the results of this computation?
  // Maybe a hash of the combined image ids?
  if (distances[imageId1] && distances[imageId1].hasOwnProperty(imageId2)) {
    return distances[imageId1][imageId2];
  } else if (distances[imageId2] && distances[imageId2].hasOwnProperty(imageId1)) {
    return distances[imageId2][imageId1];
  }

  // If the distance between these two images is not already calculated, calculate it
  const imagePosition1 = getImagePositionPatient(imageId1);
  const imagePosition2 = getImagePositionPatient(imageId2);
  const distance = imagePosition1.distanceTo(imagePosition2);

  // Store the calculated data in the cache
  distances[imageId1] = {};
  distances[imageId1][imageId2] = distance;

  // Return the distance
  return distance;
}
