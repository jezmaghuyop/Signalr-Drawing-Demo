using Microsoft.AspNetCore.SignalR;
using SignalR.Drawing.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SignalR.Drawing.Hubs
{
    public class DrawingHub : Hub
    {
        // Make sure it is static so it doesn't have to create new instance per request, that way it act as sigleton and store data
        private static List<Stroke> strokes = new List<Stroke>();

        public async Task NewStrokes(IEnumerable<Stroke> newStrokes)
        {
            lock (strokes)
            {
                strokes.AddRange(newStrokes);
            }

            var tasks = newStrokes.Select(s => Clients.Others.SendAsync("shareStrokes", s.Start, s.End));

            await Task.WhenAll(tasks);
        }

        public async Task ClearCanvas()
        {
            var task = Clients.Others.SendAsync("newCanvas");

            lock (strokes)
            {
                strokes.Clear();
            }

            await task;
        }

        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("clearCanvas");
            
            var tasks = strokes.Select(s => Clients.Caller.SendAsync("shareStrokes", s.Start, s.End));

            await Task.WhenAll(tasks);
        }
    }
}
