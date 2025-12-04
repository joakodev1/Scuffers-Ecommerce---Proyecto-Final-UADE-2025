export default function DashboardHome() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Bienvenido al panel interno de Scuffers.
        </p>
      </header>

      {/* Cards estilo Shopify */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Card title="Ventas (hoy)" value="$0" />
        <Card title="Pedidos pendientes" value="0" />
        <Card title="Productos activos" value="0" />

      </section>

      {/* Placeholder para gráficos */}
      <section className="bg-white shadow-sm rounded-lg p-6">
        <p className="text-slate-500 text-sm">
          En el futuro podemos agregar un gráfico de ventas acá.
        </p>
      </section>

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}