import Sidebar from "@/components/Sidebar";

export default function AdminAddRecordPage() {
  return (
      <div  className="flex min-h-screen">
            <Sidebar role="admin" />
      <h1 className="text-2xl font-bold mb-4">Add Record</h1>
      <form className="space-y-4">
        <input type="text" placeholder="Title" className="border p-2 w-full" />
        <textarea placeholder="Details" className="border p-2 w-full" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}
