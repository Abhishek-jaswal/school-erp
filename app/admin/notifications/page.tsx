export default function AdminNotificationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Send Notification</h1>
      <form className="space-y-4">
        <input type="text" placeholder="Title" className="border p-2 w-full" />
        <textarea placeholder="Message" className="border p-2 w-full" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Send Notification
        </button>
      </form>
    </div>
  );
}
