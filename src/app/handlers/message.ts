/**
 * @description Generates a message for different operations (Create, Update, Delete) based on the provided collection name.
 * The message will vary depending on whether the operation is related to a "user" or a generic entity.
 *
 * @param {string} collectionName The name of the collection (e.g., 'users').
 * @param {'Create' | 'Update' | 'Delete'} operation The operation type to generate the appropriate message ('Create', 'Update', 'Delete').
 * @returns {string} The corresponding error message for the specified operation and collection.
 */
export const messageHandler = (collectionName: string, operation: 'Create' | 'Update' | 'Delete'): string => {
	let entity: string;

	switch (collectionName) {
		case 'users':
			entity = 'de l\'utilisateur';
			break;
		default:
			entity = 'de l\'entité';
			break;
	}

	const messages = {
		Create: {
			Error: `Une erreur est survenue lors de la création ${entity}.`
		},
		Update: {
			Error: `Une erreur est survenue lors de la mise à jour ${entity}.`
		},
		Delete: {
			Error: `Une erreur est survenue lors de la suppression ${entity}.`
		}
	}

	return messages[operation].Error;
}
