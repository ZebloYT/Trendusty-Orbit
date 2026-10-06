using System;
using System.IO;
using System.Runtime.InteropServices;
using Microsoft.Win32;

namespace TacticalCursorSetup
{
    class Program
    {
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        public static extern bool SystemParametersInfo(uint uiAction, uint uiParam, string pvParam, uint fWinIni);

        const uint SPI_SETCURSORS = 0x0057;
        const uint SPIF_UPDATEINIFILE = 0x01;
        const uint SPIF_SENDCHANGE = 0x02;

        static void Main(string[] args)
        {
            try
            {
                Console.WriteLine("Installing Tactical Cursor...");
                
                // Ensure target directory exists in AppData to avoid Admin prompt
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string cursorDir = Path.Combine(appData, "TacticalCursor");
                if (!Directory.Exists(cursorDir))
                {
                    Directory.CreateDirectory(cursorDir);
                }

                // Copy cursor from current dir to AppData
                string sourceCur = "tactical_cursor.cur";
                string destCur = Path.Combine(cursorDir, "tactical_cursor.cur");
                
                if (!File.Exists(sourceCur))
                {
                    Console.WriteLine("Error: 'tactical_cursor.cur' not found in the current directory.");
                    Console.WriteLine("Please make sure both files are extracted before running this setup.");
                    Console.ReadLine();
                    return;
                }

                File.Copy(sourceCur, destCur, true);

                // Set Registry
                RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Control Panel\Cursors", true);
                if (key != null)
                {
                    key.SetValue("Arrow", destCur);
                    // We can also set other states if needed, but Arrow is the main one.
                    key.Close();
                }

                // Apply changes
                SystemParametersInfo(SPI_SETCURSORS, 0, null, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE);

                Console.WriteLine("Cursor successfully applied! Enjoy the Tactical OS feel.");
                System.Threading.Thread.Sleep(2000);
            }
            catch (Exception ex)
            {
                Console.WriteLine("An error occurred: " + ex.Message);
                Console.ReadLine();
            }
        }
    }
}
