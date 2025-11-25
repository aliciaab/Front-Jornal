import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Calendar, TrendingUp, FileText, BarChart3, Activity, Archive, RefreshCw, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';

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

  const processPageData = () => {
    const pages1992 = {};
    const pages2024 = {};

    data1992.forEach(item => {
      const page = parseInt(item.pgn_jrl) || 0;
      const pageGroup = Math.floor(page / 5) * 5;
      pages1992[pageGroup] = (pages1992[pageGroup] || 0) + 1;
    });

    data2024.forEach(item => {
      const page = parseInt(item.pgn_jrl) || 0;
      const pageGroup = Math.floor(page / 5) * 5;
      pages2024[pageGroup] = (pages2024[pageGroup] || 0) + 1;
    });

    const allPages = [...new Set([
      ...Object.keys(pages1992).map(p => parseInt(p)), 
      ...Object.keys(pages2024).map(p => parseInt(p))
    ])].sort((a, b) => a - b);

    const pageData = allPages.map(page => ({
      pagina: `Pág ${page}-${page + 4}`,
      page: page,
      '1992': pages1992[page] || 0,
      '2024': pages2024[page] || 0,
      total: (pages1992[page] || 0) + (pages2024[page] || 0)
    })).sort((a, b) => b.total - a.total).slice(0, 10);

    return pageData;
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-t-4 border-teal-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="space-y-3">
            <p className="text-gray-800 text-xl font-semibold">Carregando dados...</p>
            <p className="text-gray-500 text-sm">Aguarde enquanto processamos as informações</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full border border-red-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3 text-center">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-6 text-center text-sm leading-relaxed">{error}</p>
          <button 
            onClick={fetchData}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
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
        <div className="bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-2xl border border-gray-100">
          <p className="font-bold text-gray-800 mb-3 text-base">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm text-gray-600">{entry.name}:</span>
              </div>
              <span className="font-bold text-sm" style={{ color: entry.color }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const SectionTitle = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-center gap-4 mb-10">
      <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-2xl shadow-lg">
        <Icon className="text-white" size={24} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Decorative elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl -z-10"></div>
      
      <div className="w-full max-w-[1600px] mx-auto px-12 lg:px-24 xl:px-32 py-10 lg:py-16">
        
        {/* Header minimalista */}
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-4 rounded-2xl shadow-lg">
              <FileText className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Dashboard de Editais
              </h1>
              <p className="text-gray-600 text-base flex items-center gap-2 mt-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Análise comparativa entre décadas • 1992 vs 2024
              </p>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent rounded-full mt-6"></div>
        </header>

        {/* Estatísticas em linha - sem cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20 pb-20 border-b border-gray-200/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Calendar className="text-blue-500" size={28} />
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">1992</span>
            </div>
            <p className="text-5xl font-black text-gray-800 mb-2">{stats.total1992.toLocaleString()}</p>
            <p className="text-sm text-gray-600 font-medium mb-2">Editais publicados</p>
            <p className="text-xs text-gray-400">{stats.mediaDia1992}/dia • {stats.cadernos1992} cadernos</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Calendar className="text-emerald-500" size={28} />
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">2024</span>
            </div>
            <p className="text-5xl font-black text-gray-800 mb-2">{stats.total2024.toLocaleString()}</p>
            <p className="text-sm text-gray-600 font-medium mb-2">Editais publicados</p>
            <p className="text-xs text-gray-400">{stats.mediaDia2024}/dia • {stats.cadernos2024} cadernos</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <TrendingUp className="text-purple-500" size={28} />
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                stats.crescimento >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {stats.crescimento >= 0 ? '+' : ''}{stats.crescimento}%
              </span>
            </div>
            <p className="text-5xl font-black text-gray-800 mb-2">
              {stats.crescimentoAbs >= 0 ? '+' : ''}{stats.crescimentoAbs.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 font-medium mb-2">Variação absoluta</p>
            <p className="text-xs text-gray-400">32 anos de diferença</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Archive className="text-orange-500" size={28} />
              <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">TOTAL</span>
            </div>
            <p className="text-5xl font-black text-gray-800 mb-2">
              {(stats.total1992 + stats.total2024).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 font-medium mb-2">Editais analisados</p>
            <p className="text-xs text-gray-400">Base completa de dados</p>
          </div>
        </div>

        {/* Seção: Evolução e Distribuição */}
        <div className="mb-24 pb-24 border-b border-gray-200/50">
          <SectionTitle
            icon={TrendingUp}
            title="Evolução e Distribuição"
            subtitle="Análise temporal e por categorias"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:divide-x lg:divide-gray-200/50">
            {/* Evolução Mensal */}
            <div className="lg:pr-8">
              <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                Evolução Mensal
              </h3>
              <ResponsiveContainer width="100%" height={420}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="color1992" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="color2024" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: '14px', fontWeight: '500' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '14px', fontWeight: '500' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '15px', fontWeight: '600', paddingTop: '25px' }} />
                  <Area type="monotone" dataKey="1992" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#color1992)" />
                  <Area type="monotone" dataKey="2024" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#color2024)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Distribuição por Caderno */}
            <div className="lg:pl-8">
              <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                Distribuição por Caderno
              </h3>
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={cadernData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis dataKey="caderno" stroke="#6b7280" style={{ fontSize: '14px', fontWeight: '500' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '14px', fontWeight: '500' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '15px', fontWeight: '600', paddingTop: '25px' }} />
                  <Bar dataKey="1992" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="2024" fill="#10b981" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Seção: Análise Detalhada */}
        <div className="mb-24 pb-24 border-b border-gray-200/50">
          <SectionTitle
            icon={Activity}
            title="Análise Detalhada"
            subtitle="Comparativos e distribuições específicas"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:divide-x lg:divide-gray-200/50">
            {/* Comparativo Anual */}
            <div className="lg:col-span-2 lg:pr-8">
              <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                Comparativo Anual
              </h3>
              <ResponsiveContainer width="100%" height={470}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#d1d5db" strokeWidth={1} />
                  <PolarAngleAxis dataKey="mes" style={{ fontSize: '13px', fontWeight: '600' }} />
                  <PolarRadiusAxis style={{ fontSize: '12px' }} />
                  <Radar name="1992" dataKey="1992" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.25} />
                  <Radar name="2024" dataKey="2024" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.25} />
                  <Legend wrapperStyle={{ fontSize: '15px', fontWeight: '600', paddingTop: '25px' }} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Por Páginas */}
            <div className="lg:pl-8">
              <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                Por Páginas
              </h3>
              <ResponsiveContainer width="100%" height={470}>
                <BarChart data={pageData} layout="vertical" margin={{ left: 15, right: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#6b7280" style={{ fontSize: '13px', fontWeight: '500' }} />
                  <YAxis 
                    type="category" 
                    dataKey="pagina" 
                    stroke="#6b7280" 
                    style={{ fontSize: '13px', fontWeight: '600' }} 
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '600' }} />
                  <Bar dataKey="1992" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={24} />
                  <Bar dataKey="2024" fill="#10b981" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Seção: Crescimento */}
        <div className="mb-24">
          <SectionTitle
            icon={TrendingUp}
            title="Análise de Crescimento"
            subtitle="Diferença absoluta entre 2024 e 1992"
          />
          
          <ResponsiveContainer width="100%" height={460}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
              <XAxis dataKey="mes" stroke="#6b7280" style={{ fontSize: '15px', fontWeight: '600' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '15px', fontWeight: '500' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="diferenca" radius={[10, 10, 0, 0]} barSize={60}>
                {monthlyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.diferenca >= 0 ? '#10b981' : '#ef4444'}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <footer className="text-center py-8">
          <p className="text-gray-600 text-sm font-medium mb-2 flex items-center gap-2 justify-center">
            <Sparkles className="text-emerald-500" size={16} />
            Dashboard de Análise de Editais
          </p>
          <p className="text-gray-400 text-xs mb-4">
            Base de {(stats.total1992 + stats.total2024).toLocaleString()} editais analisados • Dados: 1992 e 2024
          </p>
          <button 
            onClick={fetchData}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm"
          >
            <RefreshCw size={14} />
            Atualizar dados
          </button>
        </footer>
      </div>
    </div>
  );
}