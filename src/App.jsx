import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Calendar, TrendingUp, FileText, BarChart3, Activity, Archive, Menu, X } from 'lucide-react';

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

  // Processa dados mensais
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

  // Processa dados de cadernos
  const processCadernData = () => {
    const cadernos1992 = {};
    const cadernos2024 = {};

    data1992.forEach(item => {
      const caderno = `Cad ${item.cardern_jrl}`;
      cadernos1992[caderno] = (cadernos1992[caderno] || 0) + 1;
    });

    data2024.forEach(item => {
      const caderno = `Cad ${item.cardern_jrl}`;
      cadernos2024[caderno] = (cadernos2024[caderno] || 0) + 1;
    });

    const allCadernos = [...new Set([...Object.keys(cadernos1992), ...Object.keys(cadernos2024)])];
    
    return allCadernos.map(caderno => ({
      caderno,
      '1992': cadernos1992[caderno] || 0,
      '2024': cadernos2024[caderno] || 0
    })).sort((a, b) => (b['2024'] + b['1992']) - (a['2024'] + a['1992'])).slice(0, 8);
  };

  // Processa distribuição de páginas
  const processPageData = () => {
    const pages1992 = {};
    const pages2024 = {};

    data1992.forEach(item => {
      const page = Math.floor(item.pgn_jrl / 5) * 5;
      pages1992[page] = (pages1992[page] || 0) + 1;
    });

    data2024.forEach(item => {
      const page = Math.floor(item.pgn_jrl / 5) * 5;
      pages2024[page] = (pages2024[page] || 0) + 1;
    });

    const allPages = [...new Set([...Object.keys(pages1992), ...Object.keys(pages2024)])]
      .sort((a, b) => a - b)
      .slice(0, 10);

    return allPages.map(page => ({
      pagina: `${page}-${parseInt(page) + 4}`,
      '1992': pages1992[page] || 0,
      '2024': pages2024[page] || 0
    }));
  };

  // Radar Chart - Comparação mensal
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-emerald-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-emerald-500 absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 text-lg mt-6 font-medium">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full border border-red-100">
          <div className="text-red-500 text-5xl sm:text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 text-center">Erro ao carregar</h2>
          <p className="text-gray-600 mb-4 text-center text-sm sm:text-base">{error}</p>
          <button 
            onClick={fetchData}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition font-medium shadow-lg"
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
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-xl border border-gray-100">
          <p className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs sm:text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <header className="mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg">
              <FileText className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Dashboard de Editais
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Análise comparativa entre décadas</p>
            </div>
          </div>
        </header>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-emerald-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <Calendar className="text-blue-600" size={20} />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-full">1992</span>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1">{stats.total1992.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Editais publicados</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Activity size={12} />
              <span>{stats.mediaDia1992}/dia • {stats.cadernos1992} cadernos</span>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-emerald-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-emerald-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <Calendar className="text-emerald-600" size={20} />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-1 rounded-full">2024</span>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1">{stats.total2024.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Editais publicados</p>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Activity size={12} />
              <span>{stats.mediaDia2024}/dia • {stats.cadernos2024} cadernos</span>
            </div>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-emerald-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <TrendingUp className="text-purple-600" size={20} />
              </div>
              <span className={`text-xs font-bold px-2 sm:px-3 py-1 rounded-full ${
                stats.crescimento >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {stats.crescimento >= 0 ? '+' : ''}{stats.crescimento}%
              </span>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1">
              {stats.crescimentoAbs >= 0 ? '+' : ''}{stats.crescimentoAbs.toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Variação absoluta</p>
            <p className="text-xs text-gray-400">32 anos de diferença</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-emerald-100 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-100 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                <Archive className="text-orange-600" size={20} />
              </div>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 sm:px-3 py-1 rounded-full">TOTAL</span>
            </div>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1">
              {(stats.total1992 + stats.total2024).toLocaleString()}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">Editais analisados</p>
            <p className="text-xs text-gray-400">Base completa de dados</p>
          </div>
        </div>

        {/* Gráficos principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          
          {/* Evolução Mensal - Area Chart */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-emerald-100">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-1.5 sm:p-2 rounded-lg">
                <TrendingUp className="text-white" size={18} />
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Evolução Mensal</h2>
            </div>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="color1992" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="color2024" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="1992" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#color1992)" />
                  <Area type="monotone" dataKey="2024" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#color2024)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribuição por Caderno */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-emerald-100">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-blue-400 to-indigo-500 p-1.5 sm:p-2 rounded-lg">
                <BarChart3 className="text-white" size={18} />
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Por Caderno</h2>
            </div>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <BarChart data={cadernData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="caderno" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="1992" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="2024" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráficos secundários */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          
          {/* Radar Chart */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-emerald-100 lg:col-span-2">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-1.5 sm:p-2 rounded-lg">
                <Activity className="text-white" size={18} />
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Comparativo Anual</h2>
            </div>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={300} minWidth={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="mes" style={{ fontSize: '10px' }} />
                  <PolarRadiusAxis style={{ fontSize: '10px' }} />
                  <Radar name="1992" dataKey="1992" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="2024" dataKey="2024" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribuição por Páginas */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-emerald-100">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-orange-400 to-red-500 p-1.5 sm:p-2 rounded-lg">
                <FileText className="text-white" size={18} />
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Por Páginas</h2>
            </div>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={300} minWidth={250}>
                <BarChart data={pageData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '10px' }} />
                  <YAxis type="category" dataKey="pagina" stroke="#9ca3af" style={{ fontSize: '10px' }} width={50} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="1992" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                  <Bar dataKey="2024" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráfico grande - Diferença mensal */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-emerald-100">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="bg-gradient-to-br from-teal-400 to-cyan-500 p-1.5 sm:p-2 rounded-lg">
              <TrendingUp className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Análise de Crescimento Mensal</h2>
              <p className="text-xs sm:text-sm text-gray-500">Diferença absoluta entre 2024 e 1992</p>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={300} minWidth={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="diferenca" fill="#10b981" radius={[8, 8, 0, 0]}>
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.diferenca >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 sm:mt-10 text-center text-gray-400 text-xs sm:text-sm">
          <p>Dashboard de Análise de Editais • Dados: 1992 e 2024</p>
        </footer>
      </div>
    </div>
  );
}