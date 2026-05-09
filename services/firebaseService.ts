import { db } from './firebase';
import { ref, get, set, update, push, remove, child, query, orderByChild, limitToLast } from 'firebase/database';

/**
 * Fetches data from a specified path in the database.
 * @param path The path to the data.
 */
export const getData = async <T>(path: string): Promise<T | null> => {
    try {
        const snapshot = await get(child(ref(db), path));
        if (snapshot.exists()) {
            return snapshot.val() as T;
        }
        return null;
    } catch (error) {
        console.error(`Firebase getData Error on path "${path}":`, error);
        throw error;
    }
};

/**
 * Replaces the data at a specified path. Use with caution as it overwrites everything at that path.
 * @param path The path to the data.
 * @param data The data to write.
 */
export const setData = async <T>(path: string, data: T): Promise<void> => {
    try {
        return await set(ref(db, path), data);
    } catch (error) {
        console.error(`Firebase setData Error on path "${path}":`, error);
        throw error;
    }
};

/**
 * Updates specific fields at a specified path without overwriting other data.
 * @param path The path to the data.
 * @param data The partial data to update.
 */
export const updateData = async <T>(path: string, data: Partial<T>): Promise<void> => {
    try {
        return await update(ref(db, path), data as object);
    } catch (error) {
        console.error(`Firebase updateData Error on path "${path}":`, error);
        throw error;
    }
};

interface FirebasePushResponse {
    key: string | null;
}

/**
 * Adds a new item to a list. Firebase generates a unique key.
 * @param path The path to the list (e.g., 'users').
 * @param data The data for the new item.
 * @returns The response from Firebase, containing the generated key.
 */
export const pushData = async <T>(path: string, data: T): Promise<FirebasePushResponse> => {
    try {
        const newRef = push(ref(db, path), data);
        return { key: newRef.key };
    } catch (error) {
        console.error(`Firebase pushData Error on path "${path}":`, error);
        throw error;
    }
}

/**
 * Deletes data at a specified path.
 * @param path The path to the data to delete.
 */
export const deleteData = async (path: string): Promise<void> => {
    try {
        return await remove(ref(db, path));
    } catch (error) {
        console.error(`Firebase deleteData Error on path "${path}":`, error);
        throw error;
    }
};

/**
 * Performs a multi-path update.
 * @param updates An object where keys are paths and values are the data to write.
 */
export const getRecentData = async <T>(path: string, limit = 50): Promise<T | null> => {
    try {
        const q = query(ref(db, path), orderByChild('createdAt'), limitToLast(limit));
        const snapshot = await get(q);
        if (snapshot.exists()) {
            return snapshot.val() as T;
        }
        return null;
    } catch (error) {
        console.error(`Firebase getRecentData Error on path "${path}":`, error);
        throw error;
    }
};

export const performMultiPathUpdate = async (updates: object): Promise<void> => {
    try {
        return await update(ref(db), updates);
    } catch (error) {
        console.error(`Firebase multi-path update Error:`, error);
        throw error;
    }
};