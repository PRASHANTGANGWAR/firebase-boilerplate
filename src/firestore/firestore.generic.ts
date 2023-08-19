import { generateUniqueSlug } from '../helper/index';

/**
 * Asynchronously creates a new document in Firestore under the specified collection with the provided data.
 * @param {object} db - The Firestore instance to use for the database operation.
 * @param {string} collectionName - The name of the collection where the new document will be created.
 * @param {object} dataObj - The object containing the data to be stored in the new document.
 * @returns {Promise} A Promise that resolves with the reference to the newly created document in Firestore.
 */
export async function create(db, collectionName, dataObj) {
  return await db.collection(collectionName).add(dataObj);
}

/**
 * Asynchronously retrieves data from Firestore based on a specific where clause.
 * @param {Object} obj - An object containing the required parameters.
 *   - db: The Firestore instance to use for database operations.
 *   - collectionName: The name of the collection from which data will be fetched.
 *   - columnName: The name of the field on which the where clause will be applied.
 *   - value: The value to compare against the columnName in the where clause.
 * @returns {Promise<Array>} A Promise that resolves with an array containing the retrieved data documents that match the where clause.
 */
export async function getDataWithWhereClause(obj) {
  const { db, collectionName, columnName, value } = obj;
  const dataArr = [];
  // Get a reference to the specified collection.
  const collectionRef = db.collection(collectionName);
  // Create a query with the specified where clause.
  const query = collectionRef.where(columnName, '==', value);
  // Execute the query and wait for the results.
  const data = await query.get();
  // Iterate through the result documents and extract the data, then add them to the dataArr.
  data.forEach((doc) => {
    dataArr.push(doc.data());
  });
  // Return the array containing the retrieved data documents.
  return dataArr;
}

/**
 * Asynchronously stores data with references in Firestore.
 * @param {Object} obj - An object containing the required parameters.
 *   - db: The Firestore instance to use for database operations.
 *   - firstRefCollectionName: The name of the first reference collection where the data will be linked.
 *   - secondRefCollectionName: (Optional) The name of the second reference collection where the data will be linked.
 *   - collectionName: The name of the collection where the dataObj will be stored.
 *   - firstReferenceId: The document ID of the first reference.
 *   - secondReferenceId: (Optional) The document ID of the second reference.
 *   - dataObj: The object containing the data to be stored in the collection.
 * @returns {Promise} A Promise that resolves with the reference to the newly created document in Firestore.
 */
export async function storeDataWithReference(obj) {
  const {
    db,
    firstRefCollectionName,
    secondRefCollectionName,
    collectionName,
    firstReferenceId,
    secondReferenceId,
    dataObj,
  } = obj;
  // If a second reference collection and ID are provided, add the reference to the dataObj.
  if (secondRefCollectionName && secondReferenceId) {
    dataObj[secondRefCollectionName] = db
      .collection(secondRefCollectionName)
      .doc(secondReferenceId);
  }
  // Add the reference to the first reference collection to the dataObj.
  dataObj[firstRefCollectionName] = db
    .collection(firstRefCollectionName)
    .doc(firstReferenceId);
  // Store the dataObj in the specified collection and return the Promise for the newly created document.
  return await db.collection(collectionName).add(dataObj);
}

/**
 * Asynchronously retrieves all data documents from a Firestore collection.
 * @param {object} db - The Firestore instance to use for database operations.
 * @param {string} collectionName - The name of the collection from which data will be fetched.
 * @returns {Promise<Array>} A Promise that resolves with an array containing all the data documents in the specified collection.
 */
export async function getAllData(db, collectionName) {
  const dataArr = [];
  // Get a reference to the specified collection.
  const collectionRef = db.collection(collectionName);
  // Fetch all documents in the collection and wait for the snapshot.:
  const snapshot = await collectionRef.get();
  snapshot.forEach((doc) => {
    dataArr.push(doc.data());
  });
  // Return the array containing all the retrieved data documents.
  return dataArr;
}

/**
 * Asynchronously retrieves data documents from a Firestore collection based on a relationship with another collection.
 * @param {Object} data - An object containing the required parameters.
 *   - db: The Firestore instance to use for database operations.
 *   - collectionName: The name of the collection that holds the reference value.
 *   - refCollectionName: The name of the collection where the relationship is established.
 *   - key: The field in the refCollectionName to compare against the reference value.
 *   - value: The reference value to search for in the refCollectionName.
 * @returns {Promise<Array>} A Promise that resolves with an array containing the retrieved data documents that match the relationship.
 */
export async function firestorCollectionRelation(data) {
  const { db, collectionName, refCollectionName, key, value } = data;
  // Get a reference to a specific document in the collection that holds the reference value.
  const ref = db.collection(refCollectionName).doc(value.toString());
  // Create a query to find documents in the refCollectionName where the specified key matches the reference value.
  const querySnapshot = await db
    .collection(collectionName)
    .where(key, '==', ref)
    .get();
  const results = [];
  querySnapshot.forEach((doc) => {
    results.push(doc.data());
  });
  // Return the array containing the retrieved data documents that match the specified relationship.
  return results;
}

/**
 * Asynchronously updates multiple documents in a Firestore collection based on a specific where clause.
 * @param {Object} obj - An object containing the required parameters.
 *   - db: The Firestore instance to use for database operations.
 *   - collectionName: The name of the collection in which to perform the updates.
 *   - key: The field in the collection to compare against the value in the where clause.
 *   - value: The value to compare against the 'key' field in the where clause.
 *   - updateData: An object containing the fields and their updated values to be applied to the matching documents.
 */
export async function updateWithWhere(obj) {
  const { db, collectionName, key, value, updateData } = obj;
  // Get a reference to the specified collection.
  const collectionRef = db.collection(collectionName);
  // Create a query to find documents in the collection where the specified key matches the provided value.
  const query = collectionRef.where(key, '==', value);
  const data = await query.get();
  // Initialize a batch operation to update multiple documents at once.
  const batch = db.batch();
  data.forEach((doc) => {
    const docRef = collectionRef.doc(doc.id);
    batch.update(docRef, updateData);
  });
  // Commit the batch operation to update all the documents.
  batch.commit();
}

/**
 * Asynchronously checks if a given slug is unique within a Firestore collection and generates a unique slug if necessary using recursion.
 * @param {object} db - The Firestore instance to use for database operations.
 * @param {string} collectionName - The name of the collection to check for the uniqueness of the slug.
 * @param {string} slug - The slug to check for uniqueness within the collection.
 * @returns {Promise<string>} A Promise that resolves with a unique slug that is not present in the collection.
 */
export async function checkSlugRecursive(db, collectionName, slug) {
  const data = await getDataWithWhereClause({
    db,
    collectionName,
    columnName: 'slug',
    value: slug,
  });
  if (!data.length) {
    return slug;
  } else {
    // If data with the provided slug already exists in the collection,
    // generate a new unique slug using the generateUniqueSlug function.
    const newSlug = generateUniqueSlug();
    // Recursively call the checkSlugRecursive function with the new unique slug to check for its uniqueness.
    return await checkSlugRecursive(db, collectionName, newSlug);
  }
}

export async function firestorCollectionRelationWithMultipleWhere(data) {
  const {
    db,
    collectionName,
    refCollectionName,
    keyOne,
    valueOne,
    keyTwo,
    valueTwo,
  } = data;
  const ref = db.collection(collectionName).doc(valueOne.toString());
  let querySnapshot;
  if (refCollectionName) {
    querySnapshot = await db
      .collection(refCollectionName)
      .where(keyOne, '==', ref)
      .where(keyTwo, '==', valueTwo)
      .get();
  } else {
    querySnapshot = await db
      .collection(collectionName)
      .where(keyOne, '==', ref)
      .where(keyTwo, '==', valueTwo)
      .get();
  }
  const results = [];
  querySnapshot.forEach((doc) => {
    results.push(doc.data());
  });
  return results;
}

/**
 * Asynchronously deletes documents from a Firestore collection based on specific references and criteria.
 * @param {Object} obj - An object containing the required parameters.
 *   - db: The Firestore instance to use for database operations.
 *   - collectionName: The name of the collection where the reference documents are located.
 *   - refCollectionName: The name of the collection where the relationship is established.
 *   - keyOne: The field in the refCollectionName to compare against the reference value from collectionName.
 *   - valueOne: The reference value from collectionName to search for in the refCollectionName.
 *   - keyTwo: The additional field in the refCollectionName to compare against the provided valueTwo.
 *   - valueTwo: The value to compare against the 'keyTwo' field in the refCollectionName (optional).
 * @returns {Promise<void>} A Promise that resolves when all matching documents are deleted from the refCollectionName.
 */
export async function deleteWithReference(obj): Promise<void> {
  const {
    db,
    collectionName,
    refCollectionName,
    keyOne,
    valueOne,
    keyTwo,
    valueTwo,
  } = obj;
  const ref = db.collection(collectionName).doc(valueOne.toString());
  const snapshot = await db
    .collection(refCollectionName)
    .where(keyOne, '==', ref)
    .where(keyTwo, '==', valueTwo)
    .get();
  // Create an array of delete promises for each matching document in the refCollectionName.
  const deletePromises = snapshot.docs.map((doc) => doc.ref.delete());
  // Wait for all delete promises to complete using Promise.all().
  await Promise.all(deletePromises);
}

/**
 * Asynchronously deletes documents from a Firestore collection based on a specific where clause.
 * @param {Object} obj - An object containing the required parameters.
 *   - db: The Firestore instance to use for database operations.
 *   - collectionName: The name of the collection from which data will be deleted.
 *   - field: The field in the collection to compare against the provided value.
 *   - value: The value to compare against the 'field' in the where clause.
 * @returns {Promise<void>} A Promise that resolves when all matching documents are deleted from the Firestore collection.
 */
export async function deleteDataWithWhereClause(obj): Promise<void> {
  const { db, collectionName, field, value } = obj;
  const snapshot = await db
    .collection(collectionName)
    .where(field, '==', value)
    .get();
  const batch = db.batch();

  snapshot.forEach((doc) => batch.delete(doc.ref));
  // Commit the batch operation to delete all the matching documents.
  await batch.commit();
}

export async function getDataFromCollectionGroup(
  db,
  collectionName: string,
): Promise<any[]> {
  const querySnapshot = await db.collectionGroup(collectionName).get();
  const data = querySnapshot.docs.map((doc) => doc.data());
  return data;
}

export async function getDataWithMulipleConditon(data) {
  const {
    db,
    collectionName,
    refCollectionName,
    value,
    key,
    startValue,
    endValue,
    count,
  } = data;
  const ref = db.collection(refCollectionName).doc(value.toString());
  if (count) {
    const query = await db
      .collection(collectionName)
      .where(refCollectionName, '==', ref)
      .where(key, '>', startValue)
      .where(key, '<', endValue);
    const snapshot = await query.count().get();
    return snapshot.data().count;
  } else {
    const snapshot = await db
      .collection(collectionName)
      .where(refCollectionName, '==', ref)
      .where(key, '>', startValue)
      .where(key, '<', endValue)
      .get();
    const results = [];
    snapshot.forEach((doc) => {
      results.push(doc.data());
    });
    return results;
  }
}

export async function updateWithMultipleCondition(obj) {
  const { db, collectionName, dataArr, key, startValue, endValue } = obj;
  const snapshot = await db
    .collection(collectionName)
    .where(key, '>', startValue)
    .where(key, '<', endValue)
    .get();

  const batch = db.batch();
  snapshot.forEach((doc) => {
    const docRef = db.collection(collectionName).doc(doc.id);
    batch.update(docRef, dataArr);
  });

  await batch.commit();
}

export async function checkDataExistsForcoloumn(obj) {
  const { db, collectionName, key, value } = obj;
  const querySnapshot = await db
    .collection(collectionName)
    .where(key, 'array-contains', value)
    .get();
  return querySnapshot.docs.map((doc) => doc.data());
}

export async function deleteRecord(data) {
  const {
    db,
    collectionName,
    refCollectionName,
    value,
    key,
    startValue,
    endValue,
  } = data;
  const ref = db.collection(refCollectionName).doc(value.toString());
  const query = await db
    .collection(collectionName)
    .where(refCollectionName, '==', ref)
    .where(key, '>', startValue)
    .where(key, '<', endValue)
    .get();

  const batch = db.batch();
  query.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  return true;
}
