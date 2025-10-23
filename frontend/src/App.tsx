import { useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface Order {
    id: number;
    details: string;
}

const qc = new QueryClient();

function Order() {
    const [orderId, setOrderId] = useState(1);

    const { 
        data: order,
        isPending,
    } = useQuery({
        queryKey: ["order", orderId],
        queryFn: async () => {
            try {
                const response = await fetch(`http://localhost:8081/order/${orderId}`);
                const json = await response.json();
                return json as Order;
            } catch (e) {
                console.error(e); 
            }
            return undefined;
        },
    });

    return (
        <>
            <button onClick={() => setOrderId(orderId - 1)}>
                Decrement
            </button>
            <button onClick={() => { setOrderId(orderId + 1); }}>
                Increment
            </button>
            {isPending && <div>Loading</div>}
            {!isPending && (
                <div>
                    <h3>Order {orderId} details</h3>
                    <p>{order ? order.details : ("Not found")}</p>
                </div>
            )}
        </>
    )
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <QueryClientProvider client={qc}>
            <Order />
        </QueryClientProvider>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
