#!/usr/bin/env python
#
# Web server for the static part of Ubiquitous Citizen Desk
#

from BaseHTTPServer import HTTPServer
from BaseHTTPServer import BaseHTTPRequestHandler
import sys, os, time, atexit, signal, logging
import urlparse
import pwd, grp

WEB_DIR = '/opt/ubicd/var/www/static'
WEB_ADDRESS = '127.0.0.1'
WEB_PORT = 8101
WEB_USER = 'www-data'
WEB_GROUP = 'www-data'
HOME_DIR = '/tmp'
LOG_PATH = '/opt/ubicd/var/log/ubicd_static.log'
#LOG_PATH = ''
PID_PATH = '/opt/ubicd/var/run/ubicd_static.pid'
TO_DAEMONIZE = True
#TO_DAEMONIZE = False
SERVER_NAME = 'static'
#LOG_LEVEL = logging.WARNING
LOG_LEVEL = logging.INFO

class RequestHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        message = "%s - - [%s] %s\n" % (self.address_string(), self.log_date_time_string(), format%args)
        logging.info(message.strip())

    def do_GET(self):
        parsed_path = urlparse.urlparse(self.path)
        #parsed_params = urlparse.parse_qs(parsed_path.query)

        correct = True
        message = ''
        file_path = ''
        headers = [('X-Content-Type-Options', 'nosniff')]

        if correct:
            if not parsed_path.path:
                correct = False

        if correct:
            if '/' != parsed_path.path[0]:
                correct = False

        if correct:
            if '/' == parsed_path.path:
                message = '<!DOCTYPE html><html><body><div>Ubiquitous Citizen Desk</div><div><a href="lets/bookmarks.html">bookmarks</a></div></body></html>'
            else:
                file_path = os.path.join(WEB_DIR, parsed_path.path[1:])
                if not os.path.exists(file_path):
                    logging.warning('file not found: ' + str(file_path))
                    correct = False

        if correct and file_path:
            try:
                fh = open(file_path, 'r')
                message = fh.read()
                fh.close()
            except Exception as exc:
                logging.error('error on file reading: ' + str(exc))
                correct = False

        if correct:
            if file_path.endswith('.css'):
                headers.append(('Content-type', 'text/css'))
            elif file_path.endswith('.js'):
                #not application/javascript for compatibility reasons
                headers.append(('Content-type', 'text/javascript'))
            else:
                headers.append(('Content-type', 'text/html'))

        if not correct:
            self.send_error(404)
            return

        self.send_response(200)
        for one_header in headers:
            self.send_header(one_header[0], one_header[1])
        self.end_headers()

        self.wfile.write(message)

        return

    def do_POST(self):
        self.send_error(403)
        return

def daemonize(work_dir, pid_path):
    UMASK = 022

    if (hasattr(os, 'devnull')):
       REDIRECT_TO = os.devnull
    else:
       REDIRECT_TO = '/dev/null'

    try:
        pid = os.fork()
    except OSError, e:
        logging.error('can not daemonize: %s [%d]' % (e.strerror, e.errno))
        sys.exit(1)

    if (pid != 0):
        os._exit(0)

    os.setsid()
    signal.signal(signal.SIGHUP, signal.SIG_IGN)

    try:
        pid = os.fork()
    except OSError, e:
        logging.error('can not daemonize: %s [%d]' % (e.strerror, e.errno))
        sys.exit(1)

    if (pid != 0):
        os._exit(0)

    try:
        os.chdir(work_dir)
        os.umask(UMASK)
    except OSError, e:
        logging.error('can not daemonize: %s [%d]' % (e.strerror, e.errno))
        sys.exit(1)

    try:
        sys.stdout.flush()
        sys.stderr.flush()
        si = file(REDIRECT_TO, 'r')
        so = file(REDIRECT_TO, 'a+')
        se = file(REDIRECT_TO, 'a+', 0)
        os.dup2(si.fileno(), sys.stdin.fileno())
        os.dup2(so.fileno(), sys.stdout.fileno())
        os.dup2(se.fileno(), sys.stderr.fileno())
    except OSError, e:
        logging.error('can not daemonize: %s [%d]' % (e.strerror, e.errno))
        sys.exit(1)

    if pid_path is None:
        logging.warning('no pid file path provided')
    else:
        try:
            fh = open(pid_path, 'w')
            fh.write(str(os.getpid()) + '\n')
            fh.close()
        except Exception:
            logging.error('can not create pid file: ' + str(pid_path))
            sys.exit(1)

def set_user(user_id, group_id, pid_path):
    if (user_id is not None) and (str(user_id) != '0'):
        if (pid_path is not None) and os.path.exists(pid_path):
            try:
                os.chown(pid_path, user_id, -1)
            except OSError, e:
                logging.warning('can not set pid file owner: %s [%d]' % (e.strerror, e.errno))

    if group_id is not None:
        try:
            os.setgid(group_id)
        except Exception as e:
            logging.error('can not set group id: %s [%d]' % (e.strerror, e.errno))
            sys.exit(1)

    if user_id is not None:
        try:
            os.setuid(user_id)
        except Exception as e:
            logging.error('can not set user id: %s [%d]' % (e.strerror, e.errno))
            sys.exit(1)

def cleanup():
    logging.info('stopping the ' + SERVER_NAME + ' web server')

    pid_path = PID_PATH
    if pid_path is not None:
        try:
            fh = open(pid_path, 'w')
            fh.write('')
            fh.close()
        except Exception:
            logging.warning('can not clean pid file: ' + str(pid_path))

        if os.path.isfile(pid_path):
            try:
                os.unlink(pid_path)
            except Exception:
                pass

    logging.shutdown()
    os._exit(0)

def exit_handler(signum, frame):
    cleanup()

def run_server(ip_address, port):
    logging.info('starting the ' + SERVER_NAME + ' web server')

    server_address = (ip_address, port)
    httpd = HTTPServer(server_address, RequestHandler)
    httpd.serve_forever()

if __name__ == "__main__":
    atexit.register(cleanup)

    signal.signal(signal.SIGTERM, exit_handler)
    signal.signal(signal.SIGINT, exit_handler)

    log_level = ''

    if LOG_PATH:
        logging.basicConfig(filename=LOG_PATH, level=LOG_LEVEL, format='%(levelname)s [%(asctime)s] %(message)s')
    else:
        logging.basicConfig(level=LOG_LEVEL, format='%(levelname)s [%(asctime)s] %(message)s')

    if TO_DAEMONIZE:
        daemonize(HOME_DIR, PID_PATH)

        try:
            user_info = pwd.getpwnam(WEB_USER)
            user_id = int(user_info.pw_uid)
        except:
            logging.error('can not find the web user')
            sys.exit(1)

        try:
            group_info = grp.getgrnam(WEB_GROUP)
            group_id = int(group_info.gr_gid)
        except:
            logging.error('can not find the web group')
            sys.exit(1)

        set_user(user_id, group_id, PID_PATH)

    try:
        run_server(WEB_ADDRESS, WEB_PORT)
    except Exception as exc:
        logging.error('can not start the ' + SERVER_NAME + ' web server: ' + str(exc))
        sys.exit(1)

