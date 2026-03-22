interface Props {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export default function CartSummary({ subtotal, tax, shipping, total }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-3">
      <h3 className="font-serif text-xl font-bold text-stone-800 mb-4">
        Resumen del pedido
      </h3>
      <div className="flex justify-between text-stone-600">
        <span>Subtotal</span>
        <span>{subtotal.toFixed(2)} €</span>
      </div>
      <div className="flex justify-between text-stone-600">
        <span>IVA (21%)</span>
        <span>{tax.toFixed(2)} €</span>
      </div>
      <div className="flex justify-between text-stone-600">
        <span>Envío</span>
        <span>{shipping.toFixed(2)} €</span>
      </div>
      <hr className="border-stone-200" />
      <div className="flex justify-between text-lg font-bold text-stone-800">
        <span>Total</span>
        <span>{total.toFixed(2)} €</span>
      </div>
    </div>
  );
}
