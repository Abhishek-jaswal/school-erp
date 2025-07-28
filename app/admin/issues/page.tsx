import Sidebar from "@/components/Sidebar";

export default function AdminIssuesPage() {
  return (
    <div  className="flex min-h-screen">
         <Sidebar role="admin" />
      <h1 className="text-2xl font-bold mb-4">Reported Issues</h1>
      <div className="flex-1 p-6">
        <p>Show and manage reported issues by users here.</p>
      </div>
    </div>
  );
}
