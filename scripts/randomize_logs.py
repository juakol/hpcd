#!/usr/bin/env python3
import json
import random
import time
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOGS = ROOT / 'logs'

MLN_HOSTS = [
    ('mln1.eadscasa.casa.corp', 'secondary'),
    ('mln2.eadscasa.casa.corp', 'primary'),
    ('mln3.eadscasa.casa.corp', 'secondary'),
    ('mln4.eadscasa.casa.corp', 'secondary'),
]

QUOTAS_FILE = LOGS / 'cae_adm_check_quotas.htm'
HOME15_FILE = LOGS / 'cae_nas1_check_home15.htm'
ARCHIVO_FILE = LOGS / 'cae_adm_check_archivo.htm'
QUEUE_FILE = LOGS / 'cae_adm1_check_queued_jobs.htm'
FREE_NODES_FILE = LOGS / 'cae_adm1_check_free_nodes.htm'
MLN_FILE = LOGS / 'mln2_check_osgd.htm'

def now_time() -> str:
    return datetime.now().strftime('%H:%M:%S')

def write_home15():
    awaiting = f"{random.uniform(0, 10):.2f}"
    usage = f"{random.uniform(0, 100):.2f}"
    status = "OK" if random.random() < 0.9 else "CRITICAL"
    content = f"Wait time: {awaiting}ms\tUsage: {usage}%|{status}\t{now_time()}\n"
    HOME15_FILE.write_text(content)


def write_archivo():
    is_ok = random.random() < 0.8
    status = 'OK' if is_ok else 'CRITICAL'
    msg = 'No errors found' if is_ok else 'Errors found'
    ARCHIVO_FILE.write_text(f"{msg}|{status}  {now_time()}\n")


def write_queue():
    jobs = random.randint(0, 250)
    QUEUE_FILE.write_text(f"{jobs} jobs on queue|OK\t{now_time()}\n")


def write_free_nodes():
    total = 121
    free = random.randint(0, total)
    FREE_NODES_FILE.write_text(f"Free nodes = {free} Total nodes = {total}|OK\t{now_time()}\n")


def write_mln():
    lines = []
    for host, role in MLN_HOSTS:
        if random.random() < 0.85:
            lines.append(f" - {host} ({role}): Accepting standard and secure connections.")
        else:
            lines.append(f" - {host} ({role}): NOT accepting connections.")
    lines.append(now_time())
    MLN_FILE.write_text("\n".join(lines) + "\n")


def write_quotas():
    groups = []
    try:
        groups = json.loads(QUOTAS_FILE.read_text())
    except Exception:
        pass
    if not groups:
        groups = [{"grupo": f"G{i+1}", "quedan": "OK"} for i in range(16)]
    for g in groups:
        if random.random() < 0.6:
            g["quedan"] = "OK"
        else:
            days = random.randint(1, 7)
            g["quedan"] = f"{days}days"
    QUOTAS_FILE.write_text(json.dumps(groups, indent=8))


def main():
    LOGS.mkdir(parents=True, exist_ok=True)
    while True:
        write_home15()
        write_archivo()
        write_queue()
        write_free_nodes()
        write_mln()
        write_quotas()
        time.sleep(10)

if __name__ == '__main__':
    main()