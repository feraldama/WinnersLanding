// Ejemplo de uso del componente RankingTable
import RankingTable from "./RankingTable";

export default function RankingTableExample() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Ranking Global */}
      <RankingTable 
        title="Ranking (Global)" 
        showSubTorneos={true} 
      />

      {/* Ranking en Competencia */}
      <RankingTable 
        title="Ranking (En Competencia)" 
        showSubTorneos={false} 
      />
    </div>
  );
}

