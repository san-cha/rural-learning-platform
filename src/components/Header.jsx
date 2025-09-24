export const Header = ({ user, currentLanguage = "en", onLanguageChange }) => {
  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📚</span>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Rural Learning</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="lang" className="text-sm text-gray-600">Language</label>
            <select
              id="lang"
              value={currentLanguage}
              onChange={(e) => onLanguageChange?.(e.target.value)}
              className="w-32 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {user && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
              <span className="font-medium">{user.name}</span>
              <span className="text-gray-500">({user.role})</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
