import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ProfitChart = () => {
  const data = [
    {
      bets: 90,
      totalProfit: 1000,
      theoreticalGain: 1000,
      individualProfit: 50,
    },
    {
      bets: 110,
      totalProfit: 950,
      theoreticalGain: 1100,
      individualProfit: -30,
    },
    {
      bets: 120,
      totalProfit: 1200,
      theoreticalGain: 1200,
      individualProfit: 80,
    },
    {
      bets: 130,
      totalProfit: 1150,
      theoreticalGain: 1300,
      individualProfit: -20,
    },

    {
      bets: 250,
      totalProfit: 3000,
      theoreticalGain: 2500,
      individualProfit: 150,
    },
    {
      bets: 260,
      totalProfit: 3200,
      theoreticalGain: 2600,
      individualProfit: 200,
    },
  ];

  return (
    <div className="h-[400px] w-full p-6">
      <div className="mb-4">
        <h3 className="text-foreground/50 text-sm">
          Bénéfice total (€) (par nombre de paris)
        </h3>
        <p className="bg-gradient-to-b from-[#28FCE0] to-[#00CAAF] bg-clip-text text-xl font-medium text-transparent">
          4 302€
        </p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />

          <XAxis
            dataKey="bets"
            stroke="rgba(255,255,255,0.6)"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            stroke="rgba(255,255,255,0.6)"
            tick={{ fontSize: 12 }}
            domain={[1000, 4500]}
            tickCount={8}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
            }}
            formatter={(value, name) => {
              if (name === 'individualProfit') {
                return [`${value}€`, 'Gain/Perte individuel'];
              }
              return [`${value}€`, name];
            }}
            labelFormatter={(label) => `NB de pari: ${label}`}
          />

          <Bar
            dataKey="individualProfit"
            fill={'#BE42420F'}
            // fill={(entry) =>
            //   entry.individualProfit >= 0 ? '#10b981' : '#ef4444'
            // }
            radius={[2, 2, 0, 0]}
            opacity={0.7}
          />

          <Line
            type="monotone"
            dataKey="totalProfit"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />

          <Line
            type="monotone"
            dataKey="theoreticalGain"
            stroke="#6b7280"
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
          />

          <Legend wrapperStyle={{ color: 'white' }} iconType="rect" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitChart;
