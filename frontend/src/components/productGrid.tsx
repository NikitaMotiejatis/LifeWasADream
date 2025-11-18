const products = [
  { name: "Iced Coffee", price: 4.50 },
  { name: "Iced Latte", price: 5.00 },
  { name: "Smoothie - Berry", price: 5.50 },
  { name: "Smoothie - Mango", price: 5.50 },
  { name: "Iced Tea", price: 3.50 },
  { name: "Lemonade", price: 4.00 },
  { name: "Orange Juice", price: 4.25 },
  { name: "Milkshake", price: 5.75 },
  { name: "Frappuccino", price: 5.50 },
];

export default function ProductGrid() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Checkout</h2>

      <div className="grid grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.name}
            className="bg-white rounded-lg p-4 shadow-sm hover:shadow cursor-pointer text-center"
          >
            <div className="w-20 h-20 bg-gray-200 mx-auto mb-2 rounded" />
            <p>{p.name}</p>
            <p className="text-gray-500">${p.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
