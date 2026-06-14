'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CategoryData {
  name: string
  co2: number
  color: string
}

interface CategoryBreakdownProps {
  data: CategoryData[]
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const total = data.reduce((sum, d) => sum + d.co2, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">By Category</CardTitle>
        <CardDescription>This month&apos;s emissions breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No data yet. Start logging activities.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="co2"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--foreground)',
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} kg CO₂e`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {data.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-2.5 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{item.co2.toFixed(1)} kg</span>
                    <span className="text-xs text-muted-foreground">
                      {total > 0 ? ((item.co2 / total) * 100).toFixed(0) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
