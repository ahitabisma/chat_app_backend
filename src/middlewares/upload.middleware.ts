import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { ResponseError } from "../types/response.error";

// Tipe file yang didukung
export type FileType = 'image' | 'pdf' | 'excel' | 'word' | 'csv' | 'any';

// Map tipe file ke MIME type
const mimeTypes: Record<FileType, string[]> = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    pdf: ['application/pdf'],
    excel: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    word: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    csv: ['text/csv'],
    any: ['*/*']
};

// Options
export interface UploadOptions {
    fileDir: string,
    fileTypes: FileType[],
    fileSize?: number
}

export const createUploader = (options: UploadOptions) => {

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, `public/${options.fileDir}`);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + uuidv4();
            const ext = path.extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        }
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        // Jika tipe 'any' dipilih, terima semua file
        if (options.fileTypes.includes('any')) {
            return cb(null, true);
        }

        // Membuat array dari semua mime type yang diizinkan
        const allowedMimeTypes = options.fileTypes.flatMap(type => mimeTypes[type]);

        if (allowedMimeTypes.some(mimeType =>
            mimeType === '*/*' || new RegExp(mimeType.replace('*', '.*')).test(file.mimetype)
        )) {
            cb(null, true);
        } else {
            const allowedTypes = options.fileTypes.join(', ');
            cb(new ResponseError(400, `Only ${allowedTypes} files are allowed`, {
                file: [`Only ${allowedTypes} files are allowed`]
            }));
        }
    };

    const fileSize = options.fileSize || 1 * 1024 * 1024; // Default 1MB jika tidak ditentukan

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: options.fileSize || 1 * 1024 * 1024 } // Default 1MB
    });
}

// Penggunaan uploader
export const uploadUsersPhoto = createUploader({
    fileDir: 'photo/users',
    fileTypes: ['image']
}).single('photo');

export const uploadGroupsPhoto = createUploader({
    fileDir: 'photo/groups',
    fileTypes: ['image']
}).single('photo');