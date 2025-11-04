import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Crops an image to a square by centering it and cropping the excess
 * @param imageUrl - The URL of the image to crop
 * @returns A promise that resolves to a data URL of the square cropped image
 */
export async function cropImageToSquare(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      // Check if image is already square
      if (img.width === img.height) {
        resolve(imageUrl)
        return
      }
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }
      
      // Get the smaller dimension to create a square
      const size = Math.min(img.width, img.height)
      
      // Set canvas size to square
      canvas.width = size
      canvas.height = size
      
      // Calculate the crop position to center the image
      const sourceX = (img.width - size) / 2
      const sourceY = (img.height - size) / 2
      
      try {
        // Draw the cropped image to the canvas
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          size,
          size,
          0,
          0,
          size,
          size
        )
        
        // Convert to data URL
        resolve(canvas.toDataURL('image/png'))
      } catch (error) {
        // If canvas is tainted (CORS issue), reject with specific error
        reject(new Error('CORS error: Cannot process image from this origin'))
      }
    }
    
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    
    img.src = imageUrl
  })
}