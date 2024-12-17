const TestLayout = ({ 
  children 
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="min-h-screen w-full bg-black text-white">
      {children}
    </div>
  );
};

export default TestLayout;