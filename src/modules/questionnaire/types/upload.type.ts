import { Scalar } from '@nestjs/graphql';
import { GraphQLUpload } from 'graphql-upload';

// https://vortac.io/2020/05/09/uploading-files-with-nestjs-and-graphql/
@Scalar('Upload')
export class Upload {
    description = 'File upload scalar type';

    parseValue(value) {
        return GraphQLUpload.parseValue(value);
    }

    serialize(value) {
        return GraphQLUpload.serialize(value);
    }

    parseLiteral(ast) {
        return GraphQLUpload.parseLiteral(ast, ast.value);
    }
}
