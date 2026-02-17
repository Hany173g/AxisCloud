import { createClient } from '@redis/client';

const client = createClient({
    url: process.env.REDIS_HOST || 'redis://localhost:6379',
});

client.on('error', (err) => console.error('Redis Client Error', err));

export async function connectRedis() {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Could not connect to Redis', err);
    }
}

export default client;
