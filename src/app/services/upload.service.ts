import { inject, Injectable } from '@angular/core';
import { getDownloadURL, ref, Storage, deleteObject, uploadBytesResumable } from '@angular/fire/storage';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
	private storage = inject(Storage);

	public uploadProgress$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  public async uploadFile(file: File, path: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const storageRef = ref(this.storage, path);
			const uploadTask = uploadBytesResumable(storageRef, file);

			this.uploadProgress$.next(0);

			uploadTask.on(
				'state_changed',
				snapshot => {
					const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					this.uploadProgress$.next(progress);
				},
				error => {
					console.error('Erreur d’upload :', error);
					this.uploadProgress$.next(0);
					reject(error);
				},
				async () => {
					const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
					this.uploadProgress$.next(100);
					resolve(downloadURL);
				}
			);
		});
	}

	public async deleteFile(filePath: string): Promise<void> {
		try {
			const fileRef = ref(this.storage, filePath);
			await deleteObject(fileRef);
		} catch (error) {
			console.error('Erreur lors de la suppression du fichier :', error);
		}
	}
}
