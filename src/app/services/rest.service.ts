import { inject, Injectable } from '@angular/core';
import { RestEntity } from '@Cosmose/entities/rest.entity';
import {
  Firestore,
  DocumentReference,
  CollectionReference,
  WithFieldValue,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  collection, getDocs, setDoc, updateDoc, deleteDoc, addDoc
} from '@angular/fire/firestore';
import { LimitSearchParameter, SortSearchParameter, WhereSearchParameter } from '@Cosmose/types/firebase';

@Injectable({
  providedIn: 'root'
})
export abstract class RestService<T extends RestEntity> {
  protected firestore = inject(Firestore);

  protected constructor(
    protected collectionName: string
  ) {}

  public async get(uid: string): Promise<T | null> {
    try {
      const docRef = doc(this.firestore, `${this.collectionName}/${uid}`);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return docSnap.data() as T;
    } catch (error) {
      console.error('GET : Error fetching document', error);
      return null;
    }
  }

  public async list(): Promise<T[]> {
    try {
      const collectionRef = collection(this.firestore, this.collectionName);
      const querySnapshot = await getDocs(collectionRef);

      return querySnapshot.docs.map(doc => doc.data() as T);
    } catch (error) {
      console.error('LIST : Error fetching documents', error);
      return [];
    }
  }

  public async search(queries: (WhereSearchParameter | SortSearchParameter | LimitSearchParameter)[]): Promise<T[]> {
    try {
      const collectionRef = collection(this.firestore, this.collectionName);
      let q = query(collectionRef);

      for (const p of queries) {
        if ('where' in p) {
          const whereParam = p as WhereSearchParameter;
          q = query(q, where(whereParam.where, whereParam.operator, whereParam.value));
        }
        if ('sortBy' in p) {
          const sortParam = p as SortSearchParameter;
          q = query(q, orderBy(sortParam.sortBy, sortParam.direction));
        }
        if ('limit' in p) {
          const limitParam = p as LimitSearchParameter;
          q = query(q, limit(limitParam.limit));
        }
      }

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => doc.data() as T);
    } catch (error) {
      console.error('SEARCH : Error fetching documents', error);
      return [];
    }
  }

  public async create(entity: Partial<T>): Promise<DocumentReference> {
    entity.created = new Date();
    let docRef: DocumentReference;

    try {
      if (entity.uid) {
        docRef = doc(this.firestore, `${this.collectionName}/${entity.uid}`);
        await setDoc(docRef, entity, { merge: false });

        return docRef;
      } else {
        const collectionRef = collection(this.firestore, this.collectionName) as CollectionReference<T>;
        docRef = await addDoc(collectionRef, entity as WithFieldValue<T>);
      }

      return docRef;
    } catch (error) {
      console.error('CREATE : Error creating document', error);
      return Promise.reject({ message: '', details: error });
    }
  }

  public async update(entity: Partial<T>): Promise<void> {
    if (!entity.uid) {
      return Promise.reject({ message: 'Une erreur ' });
    }

    const updatedEntity = {
      ...entity,
      updated: new Date()
    };

    try {
      const docRef = doc(this.firestore, `${this.collectionName}/${entity.uid}`);
      await updateDoc(docRef, updatedEntity);
    } catch (error) {
      console.error('UPDATE : Error updating document', error);
      return Promise.reject({ message: '', details: error });
    }
  }

  public async delete(uid: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `${this.collectionName}/${uid}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('DELETE : Error deleting document', error);
      return Promise.reject({ message: '', details: error });
    }
  }
}
