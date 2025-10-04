import { env } from '../config/env.js';
import { withConnection } from '../database/pool.js';
import { normalizeRow } from '../utils/rows.js';

const AREA_TABLES = [
  {
    name: 'administracao',
    label: 'Administração',
    description:
      'Salas moduláveis ideais para escritórios administrativos, consultorias e operações corporativas com alto fluxo de atendimento.'
  },
  {
    name: 'advocacia',
    label: 'Advocacia',
    description:
      'Estruturas reservadas e com acústica reforçada para escritórios jurídicos, mediações e atendimentos personalizados.'
  },
  {
    name: 'beleza',
    label: 'Beleza',
    description:
      'Ambientes preparados para salões de beleza, barbearias e serviços de estética rápida com grande circulação diária.'
  },
  {
    name: 'clinica',
    label: 'Clínica',
    description:
      'Consultórios equipados para especialidades médicas, odontológicas e terapias integrativas, com acessibilidade total.'
  },
  {
    name: 'coworking',
    label: 'Coworking',
    description:
      'Estações compartilhadas e salas privativas perfeitas para times híbridos, startups e profissionais autônomos.'
  },
  {
    name: 'estetica',
    label: 'Estética',
    description:
      'Espaços climatizados para clínicas de estética avançada, bem-estar e procedimentos personalizados.'
  },
  {
    name: 'gastronomia',
    label: 'Gastronomia',
    description:
      'Lojas e quiosques com infraestrutura completa para alimentação, cafés especiais e experiências gastronômicas.'
  },
  {
    name: 'imobiliaria',
    label: 'Imobiliária',
    description:
      'Unidades pensadas para imobiliárias, incorporadoras e escritórios de engenharia com salas de reunião dedicadas.'
  },
  {
    name: 'saude',
    label: 'Saúde',
    description:
      'Salas com suporte a exames, procedimentos ambulatoriais e serviços de saúde integrados ao hub.'
  },
  {
    name: 'servicos_publicos',
    label: 'Serviços Públicos',
    description:
      'Estruturas que atendem repartições públicas, cartórios, serviços financeiros e facilidades essenciais.'
  }
];

const IGNORED_FIELDS = new Set([
  'id',
  'ID',
  'slug',
  'SLUG',
  'created_at',
  'updated_at',
  'deleted_at',
  'createdAt',
  'updatedAt',
  'deletedAt'
]);

const NAME_FIELDS = ['nome', 'name', 'titulo', 'title', 'identificacao', 'identification', 'sala', 'room'];
const ID_FIELDS = ['id', 'ID', 'slug', 'SLUG', 'codigo', 'codigo_sala', 'code'];

function extractRecordId(row, fallback) {
  for (const key of ID_FIELDS) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return String(row[key]);
    }
  }

  return fallback;
}

function extractRecordName(row, fallback) {
  for (const key of NAME_FIELDS) {
    if (typeof row[key] === 'string' && row[key].trim()) {
      return row[key];
    }
  }

  return fallback;
}

export async function listAreas() {
  return withConnection(async (connection) => {
    const [tableRows] = await connection.execute(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = ?',
      [env.database.name]
    );

    const normalizedTables = Array.isArray(tableRows) ? tableRows.map((row) => normalizeRow(row)) : [];
    const availableTables = new Set(
      normalizedTables
        .map((row) => row.table_name || row.TABLE_NAME)
        .filter((name) => typeof name === 'string' && name.trim())
    );

    const items = [];

    for (const table of AREA_TABLES) {
      const baseArea = {
        id: table.name,
        slug: table.name,
        name: table.label,
        description: table.description
      };

      if (!availableTables.has(table.name)) {
        items.push({ ...baseArea, records: [] });
        continue;
      }

      try {
        const [rows] = await connection.query(`SELECT * FROM \`${table.name}\``);
        const normalizedRows = Array.isArray(rows) ? rows.map((row) => normalizeRow(row)) : [];

        const records = normalizedRows.map((row, index) => {
          const fallbackId = `${table.name}-${index + 1}`;
          const id = extractRecordId(row, fallbackId);
          const name = extractRecordName(row, `Sala ${index + 1}`);

          const fields = Object.entries(row).reduce((acc, [key, value]) => {
            if (IGNORED_FIELDS.has(key)) {
              return acc;
            }

            if (NAME_FIELDS.includes(key) && value === name) {
              return acc;
            }

            if (value === null || value === undefined || value === '') {
              return acc;
            }

            acc[key] = value;
            return acc;
          }, {});

          return { id, name, fields };
        });

        items.push({ ...baseArea, records });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`Falha ao carregar informações da tabela ${table.name}:`, error);
        items.push({ ...baseArea, records: [] });
      }
    }

    return items;
  });
}
