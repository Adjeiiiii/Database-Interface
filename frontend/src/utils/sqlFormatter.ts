/**
 * Simple SQL formatter for basic query formatting
 * This is a basic implementation - for production use, consider using a more robust library
 */

export const formatSql = (sql: string): string => {
  if (!sql || !sql.trim()) return sql;

  let formatted = sql.trim();

  // Add line breaks before major keywords
  const majorKeywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'JOIN',
    'LEFT JOIN',
    'RIGHT JOIN',
    'INNER JOIN',
    'OUTER JOIN',
    'ORDER BY',
    'GROUP BY',
    'HAVING',
    'UNION',
  ];

  majorKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    formatted = formatted.replace(regex, `\n${keyword}`);
  });

  // Add line breaks after commas in SELECT clauses
  formatted = formatted.replace(/,\s*/g, ',\n  ');

  // Add proper indentation
  const lines = formatted.split('\n');
  let indentLevel = 0;
  const indentedLines = lines.map(line => {
    const trimmedLine = line.trim();

    if (!trimmedLine) return '';

    // Decrease indent for certain keywords
    if (
      trimmedLine.match(
        /^(FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|ORDER BY|GROUP BY|HAVING|UNION)\b/i
      )
    ) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const indentedLine = '  '.repeat(indentLevel) + trimmedLine;

    // Increase indent for certain keywords
    if (
      trimmedLine.match(
        /^(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|ORDER BY|GROUP BY|HAVING|UNION)\b/i
      )
    ) {
      indentLevel++;
    }

    return indentedLine;
  });

  // Clean up extra whitespace and empty lines
  return indentedLines
    .filter(line => line.trim() !== '')
    .join('\n')
    .replace(/\n\s*\n/g, '\n')
    .trim();
};

export const highlightSqlKeywords = (sql: string): string => {
  if (!sql) return sql;

  const keywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'JOIN',
    'LEFT JOIN',
    'RIGHT JOIN',
    'INNER JOIN',
    'OUTER JOIN',
    'ON',
    'AND',
    'OR',
    'NOT',
    'IN',
    'EXISTS',
    'BETWEEN',
    'LIKE',
    'IS',
    'NULL',
    'ORDER BY',
    'GROUP BY',
    'HAVING',
    'INSERT',
    'UPDATE',
    'DELETE',
    'CREATE',
    'ALTER',
    'DROP',
    'TABLE',
    'DATABASE',
    'INDEX',
    'VIEW',
    'PROCEDURE',
    'FUNCTION',
    'TRIGGER',
    'UNION',
    'DISTINCT',
    'COUNT',
    'SUM',
    'AVG',
    'MIN',
    'MAX',
    'AS',
    'CASE',
    'WHEN',
    'THEN',
    'ELSE',
    'END',
    'LIMIT',
    'OFFSET',
    'ASC',
    'DESC',
    'PRIMARY KEY',
    'FOREIGN KEY',
    'REFERENCES',
    'CONSTRAINT',
    'CHECK',
    'UNIQUE',
    'DEFAULT',
    'AUTO_INCREMENT',
    'NOT NULL',
  ];

  let highlighted = sql;

  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    highlighted = highlighted.replace(
      regex,
      `<span style="color: #0066cc; font-weight: bold;">${keyword}</span>`
    );
  });

  return highlighted;
};
