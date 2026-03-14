import { database } from "../applications/database.js";

import {
    SHARE_LINK_COLLECTION,
    ACCESS_REQUEST_COLLECTION,
    SHARE_LINK_FIELDS,
    ACCESS_REQUEST_FIELDS
} from "../constants/sharelinks-constants.js";

export const createShareLink = async (token, data) => {
    const ref = database.collection(SHARE_LINK_COLLECTION).doc(token);
    await ref.set(data);
    return ref.id;
};

export const getShareLinkByToken = async (token) => {
    const doc = await database.collection(SHARE_LINK_COLLECTION).doc(token).get();

    if (!doc.exists) return null;

    return {
        id: doc.id,
        ...doc.data()
    };
};

export const revokeShareLink = async (token) => {
    const ref = database.collection(SHARE_LINK_COLLECTION).doc(token);

    await ref.update({
        [SHARE_LINK_FIELDS.REVOKED]: true
    });
};

export const createAccessRequest = async (data) => {
    const ref = database.collection(ACCESS_REQUEST_COLLECTION).doc();

    await ref.set(data);

    return ref.id;
};

export const getAccessRequest = async (token, requesterId) => {
    const snapshot = await database
        .collection(ACCESS_REQUEST_COLLECTION)
        .where(ACCESS_REQUEST_FIELDS.TOKEN, "==", token)
        .where(ACCESS_REQUEST_FIELDS.REQUESTER_ID, "==", requesterId)
        .limit(1)
        .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];

    return {
        id: doc.id,
        ...doc.data()
    };
};

export const getAccessRequestsByToken = async (token) => {
    const snapshot = await database
        .collection(ACCESS_REQUEST_COLLECTION)
        .where(ACCESS_REQUEST_FIELDS.TOKEN, "==", token)
        .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

export const updateAccessRequestStatus = async (requestId, status) => {
    const ref = database.collection(ACCESS_REQUEST_COLLECTION).doc(requestId);

    await ref.update({
        [ACCESS_REQUEST_FIELDS.STATUS]: status,
        [ACCESS_REQUEST_FIELDS.UPDATED_AT]: new Date()
    });
};