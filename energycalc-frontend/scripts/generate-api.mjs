import { resolve } from 'path';
import { generateApi } from 'swagger-typescript-api';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

generateApi({
    name: 'Api.ts',
    output: resolve(__dirname, '../src/api'),
    url: 'http://localhost:8000/swagger/?format=openapi',
    httpClientType: 'axios',
    generateClient: true,
    generateRouteTypes: false,
    generateResponses: true,
    toJS: false,
    extractRequestParams: true,
    extractRequestBody: true,
    extractEnums: true,
    unwrapResponseData: false,
    defaultResponseAsSuccess: false,
    singleHttpClient: true,
    cleanOutput: false,
    enumNamesAsValues: false,
    moduleNameFirstTag: false,
    generateUnionEnums: false,
    typePrefix: '',
    typeSuffix: '',
    enumKeyPrefix: '',
    enumKeySuffix: '',
    addReadonly: false,
    generateResponses: true,
    httpClientType: 'axios',
    defaultResponseType: 'void',
    codeGenConstructs: (constructs) => constructs,
    primitiveTypeConstructs: (constructs) => constructs,
});

