import { Collection, Field } from "@/types";

const MONGOOSE_TYPE_MAPPING = {
    string: "String",
    number: "Number",
    boolean: "Boolean",
    date: "Date",
    objectId: "mongoose.Schema.Types.ObjectId",
    array: "Array",
    mixed: "mongoose.Schema.Types.Mixed",
} as const;

function generateFieldDefinition(field: Field, collections: Collection[], fieldConnections: any[] = [], currentCollection?: Collection): string {
    const { name, type, required, defaultValue, unique, index } = field;

    let fieldDef = "";
    let fieldOptions: string[] = [];

    // Handle type
    if (type === "objectId" && field.ref) {
        // Find the referenced collection
        const refCollection = collections.find(col => col.id === field.ref);
        const refName = refCollection ? refCollection.name : field.ref;
        fieldDef = `{
    type: mongoose.Schema.Types.ObjectId,
    ref: '${refName}'`;
    } else if (type === "objectId") {
        // For ObjectId fields, check connections to find referenced collection
        fieldDef = `{
    type: mongoose.Schema.Types.ObjectId`;

        // Look for a connection involving this field
        if (fieldConnections.length > 0 && currentCollection) {
            const connection = fieldConnections[0]; // Take the first connection
            let refCollectionId = null;

            // Determine which collection this field references
            if (connection.sourceCollectionId === currentCollection.id) {
                // If this field is in the source collection, it references the target collection
                refCollectionId = connection.targetCollectionId;
            } else if (connection.targetCollectionId === currentCollection.id) {
                // If this field is in the target collection, it references the source collection
                refCollectionId = connection.sourceCollectionId;
            }

            if (refCollectionId && refCollectionId !== currentCollection.id) {
                const refCollection = collections.find(col => col.id === refCollectionId);
                if (refCollection) {
                    fieldDef += `,
    ref: '${refCollection.name}'`;
                }
            }
        }
    } else if (type === "array" && field.arrayType) {
        const arrayType = MONGOOSE_TYPE_MAPPING[field.arrayType as keyof typeof MONGOOSE_TYPE_MAPPING] || "String";
        fieldDef = `[${arrayType}]`;
    } else {
        const mongooseType = MONGOOSE_TYPE_MAPPING[type as keyof typeof MONGOOSE_TYPE_MAPPING] || "String";
        fieldDef = `{
    type: ${mongooseType}`;
    }

    // Add field options
    if (required) fieldOptions.push("required: true");
    if (unique) fieldOptions.push("unique: true");
    if (index) fieldOptions.push("index: true");
    if (defaultValue) {
        const defaultVal = type === "string" ? `'${defaultValue}'` : defaultValue;
        fieldOptions.push(`default: ${defaultVal}`);
    }

    // Close the field definition
    if (fieldDef.includes("{") && !fieldDef.includes("}")) {
        if (fieldOptions.length > 0) {
            fieldDef += `,
    ${fieldOptions.join(",\n    ")}
  }`;
        } else {
            fieldDef += "\n  }";
        }
    }

    return `  ${name}: ${fieldDef}`;
}

export function generateMongooseSchema(collection: Collection, allCollections: Collection[], connections: any[] = []): string {
    const { name, fields } = collection;

    // Filter out _id field and timestamp fields as they're automatically handled by Mongoose
    const regularFields = fields.filter(field =>
        field.name !== "_id" &&
        field.name !== "createdAt" &&
        field.name !== "updatedAt"
    );

    const fieldDefinitions = regularFields.map((field, fieldIndex) => {
        // Find connections for this specific field
        // Note: We need to find the original field index in the complete fields array
        const originalFieldIndex = fields.findIndex(f => f === field);
        const fieldConnections = connections.filter(conn =>
            (conn.sourceCollectionId === collection.id && conn.sourceFieldIndex === originalFieldIndex) ||
            (conn.targetCollectionId === collection.id && conn.targetFieldIndex === originalFieldIndex)
        );

        return generateFieldDefinition(field, allCollections, fieldConnections, collection);
    }).join(",\n");

    const schemaCode = `import mongoose from 'mongoose';

const ${name}Schema = new mongoose.Schema({
${fieldDefinitions}
}, {
  timestamps: true,
  collection: '${name.toLowerCase()}'
});

// Indexes
${generateIndexes(regularFields)}

const ${name} = mongoose.model('${name}', ${name}Schema);

export default ${name};`;

    return schemaCode;
}

function generateIndexes(fields: Field[]): string {
    const indexes = fields
        .filter(field => field.index || field.unique)
        .map(field => {
            if (field.unique) {
                return `${field.name}Schema.index({ ${field.name}: 1 }, { unique: true });`;
            } else if (field.index) {
                return `${field.name}Schema.index({ ${field.name}: 1 });`;
            }
            return "";
        })
        .filter(Boolean);

    return indexes.length > 0 ? indexes.join("\n") : "// No additional indexes";
}
