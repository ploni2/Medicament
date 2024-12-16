function MedicationTracker() {
    const [count, setCount] = React.useState(0);
    const [history, setHistory] = React.useState([]);
    const [maxDose, setMaxDose] = React.useState(4);
    const [isConfiguring, setIsConfiguring] = React.useState(false);
    const [showStats, setShowStats] = React.useState(false);
    const [statsData, setStatsData] = React.useState([]);

    // Charger les données au démarrage
    React.useEffect(() => {
        const savedData = localStorage.getItem('medicationData');
        if (savedData) {
            const data = JSON.parse(savedData);
            setMaxDose(data.maxDose || 4);
            
            // Charger l'historique du jour
            const today = new Date().toDateString();
            const todayHistory = data.dailyHistory?.[today] || [];
            setCount(todayHistory.length);
            setHistory(todayHistory.map(time => new Date(time)));
        }
    }, []);

    // Sauvegarder les données
    const saveToLocalStorage = (newHistory) => {
        const savedData = localStorage.getItem('medicationData') || '{}';
        const data = JSON.parse(savedData);
        const today = new Date().toDateString();
        
        data.maxDose = maxDose;
        data.dailyHistory = data.dailyHistory || {};
        data.dailyHistory[today] = newHistory.map(date => date.toISOString());
        
        localStorage.setItem('medicationData', JSON.stringify(data));
    };

    const addDose = () => {
        if (count < maxDose) {
            const now = new Date();
            const newHistory = [...history, now];
            setCount(count + 1);
            setHistory(newHistory);
            saveToLocalStorage(newHistory);
        }
    };

    const resetCount = () => {
        setCount(0);
        setHistory([]);
        saveToLocalStorage([]);
    };

    const updateMaxDose = (newMax) => {
        const value = Math.max(1, Math.min(12, parseInt(newMax) || 4));
        setMaxDose(value);
        if (count > value) {
            setCount(value);
        }
        setIsConfiguring(false);

        // Sauvegarder dans le localStorage
        const savedData = JSON.parse(localStorage.getItem('medicationData') || '{}');
        savedData.maxDose = value;
        localStorage.setItem('medicationData', JSON.stringify(savedData));
    };

    // Vérifier le changement de jour
    React.useEffect(() => {
        const checkNewDay = () => {
            if (history.length > 0) {
                const lastDose = history[0];
                const now = new Date();
                if (lastDose.getDate() !== now.getDate()) {
                    resetCount();
                }
            }
        };

        checkNewDay();
        const interval = setInterval(checkNewDay, 60000);
        return () => clearInterval(interval);
    }, [history]);

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Suivi de Médicaments</h1>
                    <button
                        onClick={() => setIsConfiguring(!isConfiguring)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        ⚙️
                    </button>
                </div>

                {isConfiguring && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <label className="block text-sm font-medium mb-2">
                            Nombre maximum de prises par jour :
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={maxDose}
                                onChange={(e) => updateMaxDose(e.target.value)}
                                className="w-20 px-2 py-1 border rounded"
                            />
                        </div>
                    </div>
                )}

                <div className="text-center mb-6">
                    <p className="text-3xl font-bold mb-2">
                        {count} / {maxDose}
                    </p>
                    <p className="text-sm text-gray-500">
                        prises aujourd'hui
                    </p>
                </div>

                {count >= maxDose && (
                    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                        Dose maximale atteinte pour aujourd'hui
                    </div>
                )}

                <div className="flex gap-4 justify-center mb-6">
                    <button
                        onClick={addDose}
                        disabled={count >= maxDose}
                        className={`px-4 py-2 rounded-md ${
                            count >= maxDose
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        Ajouter une prise
                    </button>
                    <button
                        onClick={resetCount}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                        Réinitialiser
                    </button>
                </div>

                {history.length > 0 && (
                    <div>
                        <h3 className="font-medium mb-2">Historique des prises :</h3>
                        <ul className="space-y-1 text-sm text-gray-600">
                            {history.map((time, index) => (
                                <li key={index}>
                                    {time.toLocaleTimeString()}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

// Monter l'application
ReactDOM.render(
    <MedicationTracker />,
    document.getElementById('root')
);
