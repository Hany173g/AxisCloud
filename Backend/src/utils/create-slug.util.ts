import { v4 as uuidv4 } from 'uuid';

export function createUuid() {
    const slug = uuidv4()
    return slug
}
