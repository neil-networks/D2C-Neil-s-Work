import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  onSnapshot,
  addDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Brand, ActivityLog, OperationType, FirestoreErrorInfo, Stage } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const brandService = {
  async createBrand(brandData: Partial<Brand>) {
    const path = 'brands';
    try {
      const brandRef = doc(collection(db, path));
      const brand: Brand = {
        id: brandRef.id,
        name: brandData.name!,
        website: brandData.website,
        category: brandData.category!,
        stage: brandData.stage || 'DISCOVERED',
        score: brandData.score,
        igFollowers: brandData.igFollowers,
        isMicro: brandData.isMicro || false,
        contactName: brandData.contactName,
        contactEmail: brandData.contactEmail,
        signals: brandData.signals,
        notes: brandData.notes,
        addedBy: auth.currentUser!.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(brandRef, brand);
      
      // Log initial activity
      await this.logActivity({
        brandId: brandRef.id,
        type: 'STAGE_CHANGE',
        toStage: brand.stage,
        message: 'Brand discovered and added to pipeline',
      });
      
      return brandRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateBrand(brandId: string, updates: Partial<Brand>) {
    const path = `brands/${brandId}`;
    try {
      const brandRef = doc(db, 'brands', brandId);
      const oldBrand = (await getDoc(brandRef)).data() as Brand;
      
      await updateDoc(brandRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      if (updates.stage && updates.stage !== oldBrand.stage) {
        await this.logActivity({
          brandId,
          type: 'STAGE_CHANGE',
          fromStage: oldBrand.stage,
          toStage: updates.stage,
          message: `Stage changed from ${oldBrand.stage} to ${updates.stage}`,
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async logActivity(activityData: Partial<ActivityLog>) {
    const path = `brands/${activityData.brandId}/activities`;
    try {
      const activitiesRef = collection(db, 'brands', activityData.brandId!, 'activities');
      const activity: ActivityLog = {
        id: '', // Will be set by addDoc or we can use doc()
        brandId: activityData.brandId!,
        type: activityData.type!,
        fromStage: activityData.fromStage,
        toStage: activityData.toStage,
        message: activityData.message,
        userId: auth.currentUser!.uid,
        userName: auth.currentUser!.displayName || auth.currentUser!.email || 'Unknown User',
        createdAt: serverTimestamp(),
      };
      await addDoc(activitiesRef, activity);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  subscribeToBrands(callback: (brands: Brand[]) => void) {
    const path = 'brands';
    const q = query(collection(db, path), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const brands = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Brand));
      callback(brands);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  subscribeToActivities(brandId: string, callback: (activities: ActivityLog[]) => void) {
    const path = `brands/${brandId}/activities`;
    const q = query(collection(db, 'brands', brandId, 'activities'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ActivityLog));
      callback(activities);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  }
};
