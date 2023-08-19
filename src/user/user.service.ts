import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

import {
  checkSlugRecursive,
  create,
  deleteDataWithWhereClause,
  firestorCollectionRelation,
  getAllData,
  getDataWithWhereClause,
  storeDataWithReference,
  updateWithWhere,
} from '../firestore/index';
import fireApp from '../firestore/firbaseConfig';
import { generateUniqueSlug, collectionName } from '../helper/index';
import { CreateUser, UserAddress } from './interface/index';
@Injectable()
export class UserService {
  private firestore: admin.firestore.Firestore;
  constructor() {
    this.firestore = fireApp.firestore();
  }
  async create(reqData) {
    const cuurentDate = new Date();
    // Checking the uniqueness of the provided slug within the users collection in Firestore.
    const slug = await checkSlugRecursive(
      this.firestore,
      collectionName.USER,
      generateUniqueSlug(),
    );
    // Retrieving data from Firestore based on a specific where clause.
    // When calling this function, it fetches data from the users.
    // The where clause checks for documents where the 'email' field matches the value of 'createUserDto.email'.
    const data = await getDataWithWhereClause({
      db: this.firestore,
      collectionName: collectionName.USER,
      columnName: 'email',
      value: reqData.email,
    });
    if (data.length) return false;

    reqData = {
      ...reqData,
      slug,
      createdAt: cuurentDate,
      updatedAt: cuurentDate,
    };
    const createUser: CreateUser = reqData;

    await create(this.firestore, collectionName.USER, createUser);
    return await getDataWithWhereClause({
      db: this.firestore,
      collectionName: collectionName.USER,
      columnName: 'email',
      value: reqData.email,
    });
  }

  async findAll() {
    return await getAllData(this.firestore, collectionName.USER);
  }

  async findOne(id: string) {
    // Retrieving data from Firestore based on a specific where clause.
    // When calling this function, it fetches data from the users.
    // The where clause checks for documents where the 'fire_id' field matches the value of 'id'
    let userSlug = await getDataWithWhereClause({
      db: this.firestore,
      collectionName: collectionName.USER,
      columnName: 'fireId',
      value: id,
    });
    if (!userSlug.length) return false;
    userSlug = userSlug[0].slug;
    // Retrieving data from Firestore based on a specific where clause.
    // When calling this function, it fetches data from the users.
    // The where clause checks for documents where the 'slug' field matches the value of 'user slug'
    const userData = await getDataWithWhereClause({
      db: this.firestore,
      collectionName: collectionName.USER,
      columnName: 'slug',
      value: userSlug,
    });
    if (!userData.length) return false;
    // Retrieving related data from Firestore collections.
    // When calling this function, it looks for documents in the address related to user collection.
    // The relationship is established using the 'slug' value.
    const userAddressData = await firestorCollectionRelation({
      db: this.firestore,
      collectionName: collectionName.ADDRESS,
      refCollectionName: collectionName.USER,
      key: collectionName.USER,
      value: userSlug,
    });
    if (!userAddressData.length) return false;
    userData[0]['address'] = userAddressData[0];
    return userData;
  }

  async update(id: string, updateUserDto): Promise<boolean> {
    // Retrieving data from Firestore based on a specific where clause.
    // When calling this function, it fetches data from the users.
    // The where clause checks for documents where the 'fire_id' field matches the value of 'id'.
    let userSlug = await getDataWithWhereClause({
      db: this.firestore,
      collectionName: collectionName.USER,
      columnName: 'fireId',
      value: id,
    });
    userSlug = userSlug[0].slug;
    // Updates multiple documents in a Firestore collection where a specific field matches a given value.
    await updateWithWhere({
      db: this.firestore,
      collectionName: collectionName.USER,
      key: 'slug',
      value: userSlug,
      updateData: updateUserDto,
    });
    return true;
  }

  async remove(id: string): Promise<boolean> {
    // Retrieving data from Firestore based on a specific where clause.
    // When calling this function, it fetches data from the users.
    // The where clause checks for documents where the 'fire_id' field matches the value of 'id'
    let userSlug = await getDataWithWhereClause({
      db: this.firestore,
      collectionName: collectionName.USER,
      columnName: 'fireId',
      value: id,
    });
    userSlug = userSlug[0].slug;
    // Function to delete documents from a Firestore collection that match a specific condition.
    await deleteDataWithWhereClause({
      db: this.firestore,
      collectionName: collectionName.USER,
      field: 'slug',
      value: userSlug,
    });
    return true;
  }

  async insertUserAddress(id: string, reqData) {
    const currentDate = new Date();
    // Checking the uniqueness of the provided slug within the users collection in Firestore.
    const slug = await checkSlugRecursive(
      this.firestore,
      collectionName.USER,
      generateUniqueSlug(),
    );
    // Retrieving data from Firestore based on a specific where clause.
    // When calling this function, it fetches data from the users.
    // The where clause checks for documents where the 'fire_id' field matches the value of 'id'
    let userSlug = await getDataWithWhereClause({
      db: this.firestore,
      collectionName: collectionName.USER,
      columnName: 'fireId',
      value: id,
    });
    if (!userSlug.length) return false;
    userSlug = userSlug[0].slug;
    reqData = {
      ...reqData,
      slug,
      createdAt: currentDate,
      updatedAt: currentDate,
    };
    const userAddressOnj: UserAddress = reqData;
    // Storing data in Firestore with references to other collections.
    // The reference to users collection with 'slug' as the reference ID is added to 'dataObj'.
    // store data in address collection.
    await storeDataWithReference({
      db: this.firestore,
      firstRefCollectionName: collectionName.USER,
      collectionName: collectionName.ADDRESS,
      firstReferenceId: userSlug,
      dataObj: userAddressOnj,
    });

    return await getDataWithWhereClause({
      db: this.firestore,
      collectionName: collectionName.ADDRESS,
      columnName: 'slug',
      value: slug,
    });
  }
}
