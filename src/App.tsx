import { useEffect, useState } from "react";
import { database } from "./services/firebaseConfig";
import { ref, onValue } from "firebase/database";

function App() {
  const [data, setData] = useState<{ id: string; value: any }[]>([]);

  useEffect(() => {
    const collectionRef = ref(database, "/");

    onValue(collectionRef, (snapshot) => {
      const dataItem = snapshot.val();

      console.log("Dados recuperados:", dataItem); // 🔹 Log para depuração

      if (dataItem) {
        const formattedData = Object.entries(dataItem).map(([key, value]) => ({
          id: key,
          value,
        }));

        setData(formattedData);
      } else {
        console.log("Nenhum dado encontrado no Firebase!");
      }
    });
  }, []);

  return (
    <div>
      <h1>Dados do Firebase:</h1>
      <ul>
        {data.length > 0 ? (
          data.map(({ id, value }) => (
            <li key={id}>
              <strong>ID:</strong> {id} <br />
              <strong>Valor:</strong> {value}
            </li>
          ))
        ) : (
          <p>Carregando dados...</p>
        )}
      </ul>
    </div>
  );
}

export default App;