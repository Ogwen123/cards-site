const epoch: bigint = 1672531200000n;

export function deconstruct(idStr: string): { timestamp: bigint, worker_id: bigint, process_id: bigint, sequence: bigint } {
    const id: bigint = BigInt(idStr)
    const timestamp = (id >> 22n) + epoch;
    const worker_id = (id & 0x3E0000n) >> 17n;
    const process_id = (id & 0x1F000n) >> 12n;
    const sequence = id & 0x1FFFn;
    return { timestamp, worker_id, process_id, sequence };
}