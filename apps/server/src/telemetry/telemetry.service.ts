import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DB_URL });

@Injectable()
export class TelemetryService {
  async logEvent(eventName: string, properties: Record<string, unknown> = {}) {
    await pool.query(
      `INSERT INTO telemetry_events (event_name, properties)
       VALUES ($1, $2)`,
      [eventName, JSON.stringify(properties)]
    );
  }
}
