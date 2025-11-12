import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Calendar, TrendingUp, FileText, BarChart3, Activity, Archive, Sparkles, Zap } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

export default function JornalDashboard() {
  const [data1992, setData1992] = useState([]);
  const [data2024, setData2024] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [res1992, res2024] = await Promise.all([
        fetch(`${API_URL}/edital_1992`),
        fetch(`${API_URL}/edital_2024`)
      ]);

      if (!res1992.ok || !res2024.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const json1992 = await res1992.json();
      const json2024 = await res2024.json();

      setData1992(json1992);
      setData2024(json2024);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = () => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const count1992 = Array(12).fill(0);
    const count2024 = Array(12).fill(0);

    data1992.forEach(item => {
      const mes = parseInt(item.mes_jrl) - 1;
      if (mes >= 0 && mes < 12) count1992[mes]++;
    });

    data2024.forEach(item => {
      const mes = parseInt(item.mes_jrl) - 1;
      if (mes >= 0 && mes < 12) count2024[mes]++;
    });

    return meses.map((mes, i) => ({
      mes,
      '1992': count1992[i],
      '2024': count2024[i],
      diferenca: count2024[i] - count1992[i]
    }));
  };

  const processCadernData = () => {
    const cadernos1992 = {};
    const cadernos2024 = {};

    data1992.forEach(item => {
      const caderno = `Caderno ${item.cardern_jrl}`;
      cadernos1992[caderno] = (cadernos1992[caderno] || 0) + 1;
    });

    data2024.forEach(item => {
      const caderno = `Caderno ${item.cardern_jrl}`;
      cadernos2024[caderno] = (cadernos2024[caderno] || 0) + 1;
    });

    const allCadernos = [...new Set([...Object.keys(cadernos1992), ...Object.keys(cadernos2024)])];
    
    return allCadernos.map(caderno => ({
      caderno,
      '1992': cadernos1992[caderno] || 0,
      '2024': cadernos2024[caderno] || 0
    })).sort((a, b) => (b['2024'] + b['1992']) - (a['2024'] + a['1992'])).slice(0, 8);
  };

  const processPageData = () => {
    const pages1992 = {};
    const pages2024 = {};

    data1992.forEach(item => {
      if (item.pgn_jrl !== undefined && item.pgn_jrl !== null) {
        const page = parseInt(item.pgn_jrl);
        if (!isNaN(page)) {
          pages1992[page] = (pages1992[page] || 0) + 1;
        }
      }
    });

    data2024.forEach(item => {
      if (item.pgn_jrl !== undefined && item.pgn_jrl !== null) {
        const page = parseInt(item.pgn_jrl);
        if (!isNaN(page)) {
          pages2024[page] = (pages2024[page] || 0) + 1;
        }
      }
    });

    const allPages = [...new Set([
      ...Object.keys(pages1992).map(Number),
      ...Object.keys(pages2024).map(Number)
    ])].sort((a, b) => a - b);

    if (allPages.length === 0) {
      return [];
    }

    const pageRanges = {};
    
    allPages.forEach(page => {
      const rangeStart = Math.floor(page / 10) * 10;
      const rangeKey = `${rangeStart}-${rangeStart + 9}`;
      
      if (!pageRanges[rangeKey]) {
        pageRanges[rangeKey] = { '1992': 0, '2024': 0, rangeStart };
      }
      
      pageRanges[rangeKey]['1992'] += pages1992[page] || 0;
      pageRanges[rangeKey]['2024'] += pages2024[page] || 0;
    });

    return Object.entries(pageRanges)
      .map(([pagina, data]) => ({
        pagina,
        '1992': data['1992'],
        '2024': data['2024'],
        total: data['1992'] + data['2024'],
        rangeStart: data.rangeStart
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .sort((a, b) => a.rangeStart - b.rangeStart);
  };

  const processRadarData = () => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const count1992 = Array(12).fill(0);
    const count2024 = Array(12).fill(0);

    data1992.forEach(item => {
      const mes = parseInt(item.mes_jrl) - 1;
      if (mes >= 0 && mes < 12) count1992[mes]++;
    });

    data2024.forEach(item => {
      const mes = parseInt(item.mes_jrl) - 1;
      if (mes >= 0 && mes < 12) count2024[mes]++;
    });

    return meses.map((mes, i) => ({
      mes,
      '1992': count1992[i],
      '2024': count2024[i]
    }));
  };

  const getStats = () => {
    const crescimento = data1992.length > 0 
      ? ((data2024.length - data1992.length) / data1992.length * 100)
      : 0;

    return {
      total1992: data1992.length,
      total2024: data2024.length,
      crescimento: crescimento.toFixed(1),
      crescimentoAbs: data2024.length - data1992.length,
      mediaDia1992: (data1992.length / 365).toFixed(1),
      mediaDia2024: (data2024.length / 365).toFixed(1),
      cadernos1992: new Set(data1992.map(d => d.cardern_jrl)).size,
      cadernos2024: new Set(data2024.map(d => d.cardern_jrl)).size
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={32} />
          </div>
          <p className="text-slate-700 text-xl font-semibold">Carregando insights...</p>
          <p className="text-slate-500 text-sm mt-2">Processando dados dos editais</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md border-2 border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="text-red-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3 text-center">Ops!</h2>
          <p className="text-slate-600 mb-6 text-center leading-relaxed">{error}</p>
          <button 
            onClick={fetchData}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const monthlyData = processMonthlyData();
  const cadernData = processCadernData();
  const pageData = processPageData();
  const radarData = processRadarData();
  const stats = getStats();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-slate-200">
          <p className="font-bold text-slate-800 mb-2 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-slate-600">{entry.name}:</span>
              <span className="font-bold">{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        
        {/* Header Premium */}
        <header className="mb-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/50">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                    <FileText className="text-white" size={36} />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 mb-1">
                    Editais Analytics
                  </h1>
                  <p className="text-slate-600 text-sm md:text-base font-medium">Análise comparativa • 1992 vs 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-2xl border border-blue-100">
                <Calendar className="text-blue-600" size={20} />
                <span className="text-slate-700 font-semibold text-sm">32 anos de dados</span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1992 */}
          <div className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-blue-100/50 hover:border-blue-200 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Archive className="text-blue-600" size={26} />
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                1992
              </span>
            </div>
            <p className="text-4xl font-black text-slate-900 mb-2">{stats.total1992.toLocaleString()}</p>
            <p className="text-sm text-slate-600 font-medium mb-3">Editais publicados</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
              <Activity size={14} />
              <span className="font-medium">{stats.mediaDia1992}/dia • {stats.cadernos1992} cadernos</span>
            </div>
          </div>

          {/* Card 2024 */}
          <div className="group bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-indigo-100/50 hover:border-indigo-200 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="text-indigo-600" size={26} />
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200">
                2024
              </span>
            </div>
            <p className="text-4xl font-black text-slate-900 mb-2">{stats.total2024.toLocaleString()}</p>
            <p className="text-sm text-slate-600 font-medium mb-3">Editais publicados</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl">
              <Activity size={14} />
              <span className="font-medium">{stats.mediaDia2024}/dia • {stats.cadernos2024} cadernos</span>
            </div>
          </div>

          {/* Card Crescimento */}
          <div className="group bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-emerald-400/50 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="text-white" size={26} />
              </div>
              <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {stats.crescimento >= 0 ? '+' : ''}{stats.crescimento}%
              </span>
            </div>
            <p className="text-4xl font-black text-white mb-2">
              {stats.crescimentoAbs >= 0 ? '+' : ''}{stats.crescimentoAbs.toLocaleString()}
            </p>
            <p className="text-sm text-emerald-50 font-medium mb-3">Variação absoluta</p>
            <p className="text-xs text-emerald-100 font-medium">Crescimento em 32 anos</p>
          </div>

          {/* Card Total */}
          <div className="group bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-violet-400/50 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-3.5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="text-white" size={26} />
              </div>
              <span className="text-xs font-bold text-white bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                TOTAL
              </span>
            </div>
            <p className="text-4xl font-black text-white mb-2">
              {(stats.total1992 + stats.total2024).toLocaleString()}
            </p>
            <p className="text-sm text-violet-50 font-medium mb-3">Editais analisados</p>
            <p className="text-xs text-violet-100 font-medium">Base completa de dados</p>
          </div>
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Evolução Mensal */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-slate-200/50 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                <TrendingUp className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Evolução Mensal</h2>
                <p className="text-xs text-slate-500 mt-0.5">Publicações ao longo do ano</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="color1992" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="color2024" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="mes" stroke="#64748b" style={{ fontSize: '12px', fontWeight: '500' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px', fontWeight: '500' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '600' }} />
                <Area type="monotone" dataKey="1992" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#color1992)" />
                <Area type="monotone" dataKey="2024" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#color2024)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição por Caderno */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-slate-200/50 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg">
                <BarChart3 className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Por Caderno</h2>
                <p className="text-xs text-slate-500 mt-0.5">Distribuição por seção</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cadernData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="caderno" stroke="#64748b" style={{ fontSize: '11px', fontWeight: '500' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px', fontWeight: '500' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '600' }} />
                <Bar dataKey="1992" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="2024" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Radar Chart */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-slate-200/50 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <Activity className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Comparativo Anual</h2>
                <p className="text-xs text-slate-500 mt-0.5">Visão 360° dos meses</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="mes" style={{ fontSize: '12px', fontWeight: '600' }} />
                <PolarRadiusAxis style={{ fontSize: '11px' }} />
                <Radar name="1992" dataKey="1992" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
                <Radar name="2024" dataKey="2024" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '600' }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição por Páginas */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-slate-200/50 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-xl shadow-lg">
                <FileText className="text-white" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Por Páginas</h2>
                <p className="text-xs text-slate-500 mt-0.5">Top 10 faixas</p>
              </div>
            </div>
            {pageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={pageData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis type="number" stroke="#64748b" style={{ fontSize: '11px', fontWeight: '500' }} />
                  <YAxis type="category" dataKey="pagina" stroke="#64748b" style={{ fontSize: '10px', fontWeight: '500' }} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '600' }} />
                  <Bar dataKey="1992" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                  <Bar dataKey="2024" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-slate-400">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">Sem dados de páginas disponíveis</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Width Chart */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-slate-200/50 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2.5 rounded-xl shadow-lg">
              <TrendingUp className="text-white" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Análise de Crescimento Mensal</h2>
              <p className="text-xs text-slate-500 mt-0.5">Diferença absoluta entre 2024 e 1992</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="mes" stroke="#64748b" style={{ fontSize: '13px', fontWeight: '600' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px', fontWeight: '500' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="diferenca" radius={[8, 8, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.diferenca >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-xl px-6 py-3 rounded-full border border-slate-200 shadow-lg">
            <Sparkles className="text-blue-600" size={16} />
            <p className="text-slate-600 text-sm font-medium">
              Dashboard de Análise de Editais • 1992 vs 2024
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}