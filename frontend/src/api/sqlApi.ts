import axios from 'axios';

const API_BASE_URL = '/api/sql';

export interface SqlResponse {
  success: boolean;
  data?: any[];
  columns?: string[];
  row_count?: number;
  affected_rows?: number;
  message?: string;
  error?: string;
  execution_time?: string;
  query?: string;
}

export interface TableInfo {
  success: boolean;
  tables?: string[];
  count?: number;
  error?: string;
}

export interface SchemaInfo {
  success: boolean;
  table?: string;
  columns?: Array<{
    field: string;
    type: string;
    null: string;
    key: string;
    default: string | null;
    extra: string;
  }>;
  column_count?: number;
  error?: string;
}

export const sqlApi = {
  // Execute SQL query
  executeQuery: async (query: string): Promise<SqlResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/execute`, {
        query: query.trim(),
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Unknown error',
        message: error.response?.data?.message || 'Failed to execute query',
      };
    }
  },

  // Get all tables
  getTables: async (): Promise<TableInfo> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tables`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Unknown error',
      };
    }
  },

  // Get table schema
  getTableSchema: async (tableName: string): Promise<SchemaInfo> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/schema/${tableName}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Unknown error',
      };
    }
  },
};
