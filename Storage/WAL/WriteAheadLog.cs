using JOEX_DB_Engine.Interfaces;

namespace JOEX_DB_Engine.Storage.WAL
{
    public class WriteAheadLog : IWAL
    {
        private readonly string _path;

        public WriteAheadLog(string path)
        {
            _path = path;
        }

        public void Append(string key, string value)
        {
            var record = $"SET {key} {value}";
            File.AppendAllText(_path, record + Environment.NewLine);
        }

        public void Delete(string key)
        {
            var record = $"DEL {key}";
            File.AppendAllText(_path, record + Environment.NewLine);
        }

        public void Recover()
        {
            if (!File.Exists(_path))
                return;

            var lines = File.ReadAllLines(_path);

            foreach (var line in lines)
            {
                var parts = line.Split(' ', 3);

                if (parts.Length < 2)
                    continue;

                var op = parts[0];
                var key = parts[1];

                if (op == "SET" && parts.Length == 3)
                {
                    var value = parts[2];
                    // TODO: apply to MemTable
                }
                else if (op == "DEL")
                {
                    // TODO: remove from MemTable
                }
            }
        }
    }
}