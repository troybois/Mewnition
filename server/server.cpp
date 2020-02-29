#include "server.h"

using namespace std;

struct us_listen_socket_t* listen_socket;

int main() {
    uWS::App().ws<ClientData>( "/*", {
        .compression = uWS::SHARED_COMPRESSOR,
        .maxPayloadLength = 16 * 1024 * 1024,
        .idleTimeout = 10,
        .maxBackpressure = 1 * 1024 * 1024,
        .open = []( auto* ws, auto* req ) {
            ws->subscribe( "broadcast" );
        },
        .message = []( auto* ws, string_view msg, uWS::OpCode opcode ) {

        },
        .drain = []( auto* ws ) {

        },
        .ping = []( auto* ws ) {

        },
        .pong = []( auto* ws ) {

        },
        .close = []( auto* ws, int code, string_view message ) {

        }       
    } ).listen( stoi( getenv( "PORT" ) ), []( auto* token ) {
        listen_socket = token;
        if( token ) {
            cout << "Listening on port " << getenv( "PORT" ) << endl;
        }
    } ).run();
}
