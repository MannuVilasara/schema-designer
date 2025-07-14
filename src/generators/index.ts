import { Collection, FieldConnection } from '@/types';
import { generateMongooseSchema } from './mongoose';
import { generatePrismaSchema } from './prisma';

export type ORM = 'mongoose' | 'prisma';

export const ORM_LABELS = {
	mongoose: 'Mongoose',
	prisma: 'Prisma',
} as const;

export interface CodeGenerator {
	generate: (
		collection: Collection,
		allCollections: Collection[],
		connections?: FieldConnection[]
	) => string;
	language: string;
	fileExtension: string;
}

export const CODE_GENERATORS: Record<ORM, CodeGenerator> = {
	mongoose: {
		generate: generateMongooseSchema,
		language: 'javascript',
		fileExtension: '.js',
	},
	prisma: {
		generate: generatePrismaSchema,
		language: 'prisma',
		fileExtension: '.prisma',
	},
};

export function generateCode(
	orm: ORM,
	collection: Collection,
	allCollections: Collection[],
	connections?: FieldConnection[]
): string {
	const generator = CODE_GENERATORS[orm];
	if (!generator) {
		throw new Error(`Unsupported ORM: ${orm}`);
	}

	return generator.generate(collection, allCollections, connections);
}
