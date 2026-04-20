'use server';

import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';

export async function uploadExerciseImage(formData: FormData) {
  const imageFile = formData.get('image') as File;

  if (!imageFile) {
    throw new Error('Nessun file immagine fornito');
  }

  // Validazione base lato server
  if (!imageFile.type.startsWith('image/')) {
    throw new Error('Il file deve essere un\'immagine');
  }

  if (imageFile.size > 4.5 * 1024 * 1024) {
    throw new Error('L\'immagine è troppo pesante (max 4.5MB per il piano Hobby)');
  }

  try {
    const blob = await put(`exercises/${Date.now()}-${imageFile.name}`, imageFile, {
      access: 'public',
    });

    return blob.url;
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    throw new Error('Errore durante l\'upload dell\'immagine');
  }
}
