export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-1">About</h3>
          <p className="text-sm text-gray-500">Content Calendar - Social Media Planner</p>
          <p className="text-sm text-gray-400 mt-0.5">Version 1.0.0</p>
        </div>
        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-medium text-gray-900 mb-2">Platforms</h3>
          <div className="grid grid-cols-3 gap-2">
            {['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'X/Twitter', 'YouTube'].map(p => (
              <div key={p} className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{p}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
