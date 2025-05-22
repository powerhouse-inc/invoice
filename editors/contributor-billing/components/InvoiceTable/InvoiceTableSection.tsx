export const InvoiceTableSection = ({
  title,
  count,
  children,
  color = "bg-blue-100 text-blue-600"
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  color?: string;
}) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-2">
      <span className="font-medium">{title}</span>
      <span className={`inline-flex items-center justify-center rounded-full text-xs font-bold px-2 ${color}`}>{count}</span>
    </div>
    {children}
  </div>
); 