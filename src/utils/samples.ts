
export const SAMPLE_SVG = `
<?xml version="1.0" encoding="UTF-8"?>
<svg width="300px" height="240px" viewBox="0 0 200 240" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="test2" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <text id="{{color:Revenue}}" font-family="sans-serif" font-size="16" font-weight="normal" fill="#323130">
            <tspan x="24" y="44">Revenue: {{Revenue}}</tspan>
            <tspan x="24" y="65">Expenses: {{Expenses}}</tspan>
        </text>
        <rect id="Rectangle-{{color:Expenses,scale:#2}}" fill="#76A5F5" x="24" y="91" width="160" height="161"></rect>
    </g>
</svg>
`

export const SAMPLE_MESSAGE_1 = {
  version: '1',
  resultName: 'dd91',
  rowCount: 1,
  availableRowCount: 1,
  data: [
    [
      14.51235099824859,
      2595.146703562358,
      120.37471949000783,
      885.5554616588712,
      'Beach',
      403611.52993069455,
      140.48547547574043,
      'Jul',
    ],
  ],
  columns: [
    {
      name: 'bi141',
      label: 'Expenses {{min}}',
      type: 'number',
      usage: 'quantitative',
      aggregation: 'min',
      format: { name: 'DOLLAR', width: 15, precision: 2, formatString: 'DOLLAR15.2' },
    },
    {
      name: 'bi142',
      label: 'Revenue {{max}}',
      type: 'number',
      usage: 'quantitative',
      aggregation: 'max',
      format: { name: 'DOLLAR', width: 15, precision: 2, formatString: 'DOLLAR15.2' },
    },
    {
      name: 'bi102',
      label: 'Expenses',
      type: 'number',
      usage: 'quantitative',
      aggregation: 'average',
      format: { name: 'DOLLAR', width: 15, precision: 2, formatString: 'DOLLAR15.2' },
    },
    {
      name: 'bi112',
      label: 'Expenses {{max}}',
      type: 'number',
      usage: 'quantitative',
      aggregation: 'max',
      format: { name: 'DOLLAR', width: 15, precision: 2, formatString: 'DOLLAR15.2' },
    },
    { name: 'bi130', label: 'Department', type: 'string' },
    {
      name: 'bi103',
      label: 'Revenue',
      type: 'number',
      usage: 'quantitative',
      aggregation: 'sum',
      format: { name: 'DOLLAR', width: 15, precision: 2, formatString: 'DOLLAR15.2' },
    },
    {
      name: 'bi143',
      label: 'Revenue {{min}}',
      type: 'number',
      usage: 'quantitative',
      aggregation: 'min',
      format: { name: 'DOLLAR', width: 15, precision: 2, formatString: 'DOLLAR15.2' },
    },
    {
      name: 'bi131',
      label: 'Date',
      type: 'date',
      usage: 'categorical',
      format: { name: 'MONTH', width: 3, precision: 0, formatString: 'MONTH3' },
    },
  ],
}

export const SAMPLE_MESSAGE_2 = {
  version: '1',
  resultName: 'dd91',
  rowCount: 1,
  availableRowCount: 1,
  data: [['Bead', 'Dec', 112.81571032867849, 1329.474768526684]],
  columns: [
    { name: 'bi100', label: 'Department', type: 'string' },
    {
      name: 'bi101',
      label: 'Date',
      type: 'date',
      usage: 'categorical',
      format: { name: 'MONTH', width: 3, precision: 0, formatString: 'MONTH3' },
    },
    {
      name: 'bi102',
      label: 'Expenses {{0..300}}',
      type: 'number',
      usage: 'quantitative',
      aggregation: 'average',
      format: { name: 'DOLLAR', width: 15, precision: 2, formatString: 'DOLLAR15.2' },
    },
    {
      name: 'bi103',
      label: 'Revenue {{0.5..4820.50}}',
      type: 'number',
      usage: 'quantitative',
      aggregation: 'average',
      format: { name: 'DOLLAR', width: 15, precision: 2, formatString: 'DOLLAR15.2' },
    },
  ],
}

