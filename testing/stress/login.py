#!/usr/bin/env python3
"""
Stress test for the login endpoint
Tests concurrent login requests with metrics collection
First registers test users, then performs login stress testing
"""

import requests
import time
import uuid
import json
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from statistics import mean, stdev, median
from typing import Dict, Tuple, List
from datetime import datetime
import sys


class UserGenerator:
    """Generate unique user credentials for testing"""

    def __init__(self):
        self.users: List[Dict[str, str]] = []

    def generate(self, index: int) -> Dict[str, str]:
        """Generate unique user data"""
        unique_id = str(uuid.uuid4())[:8]
        return {
            "email": f"logintest-{index}-{unique_id}@stress-test.com",
            "password": f"LoginPass123_{unique_id}",
            "name": f"Test User {index}"
        }

    def add_user(self, user: Dict[str, str]):
        """Store user for later use"""
        self.users.append(user)


class RegistrationPhase:
    """Setup phase: Register test users"""

    def __init__(self, base_url: str, num_users: int, concurrency: int):
        self.base_url = base_url
        self.endpoint = f"{base_url}/v1/auth/register"
        self.num_users = num_users
        self.concurrency = concurrency
        self.user_generator = UserGenerator()
        self.registered_users: List[Dict[str, str]] = []
        self.errors = 0

    def send_request(self, index: int) -> Tuple[int, bool, str]:
        """Register a single user"""
        user = self.user_generator.generate(index)

        try:
            start = time.time()
            response = requests.post(
                self.endpoint,
                json=user,
                timeout=10
            )
            elapsed = time.time() - start

            is_success = response.status_code in [200, 201]
            if is_success:
                self.registered_users.append(user)

            return (index, is_success, response.status_code)
        except Exception as e:
            return (index, False, str(e))

    def run(self) -> List[Dict[str, str]]:
        """Register all test users"""
        print(f"\n{'='*70}")
        print(f"Setup Phase: Registering Test Users")
        print(f"{'='*70}")
        print(f"Endpoint:      {self.endpoint}")
        print(f"Users to create: {self.num_users}")
        print(f"Concurrency:   {self.concurrency}")
        print(f"{'='*70}\n")

        completed = 0
        start_time = time.time()

        with ThreadPoolExecutor(max_workers=self.concurrency) as executor:
            futures = {
                executor.submit(self.send_request, i): i
                for i in range(self.num_users)
            }

            for future in as_completed(futures):
                try:
                    index, is_success, status = future.result()
                    completed += 1

                    if not is_success:
                        self.errors += 1

                    progress = (completed / self.num_users) * 100
                    bar_length = 40
                    filled = int(bar_length * completed // self.num_users)
                    bar = f"[{'█' * filled}{' ' * (bar_length - filled)}]"
                    print(
                        f"\r{bar} {progress:.1f}% ({completed}/{self.num_users})", end="", flush=True)
                except Exception as e:
                    print(f"\nError: {e}")

        elapsed = time.time() - start_time
        print(f"\n\nSetup completed in {elapsed:.2f}s")
        print(
            f"Successfully registered: {len(self.registered_users)}/{self.num_users}")
        if self.errors > 0:
            print(f"Errors: {self.errors}")

        return self.registered_users


class LoginStressTest:
    """Login stress testing phase"""

    def __init__(self, base_url: str, num_requests: int, concurrency: int, users: List[Dict[str, str]]):
        self.base_url = base_url
        self.endpoint = f"{base_url}/v1/auth/login"
        self.num_requests = num_requests
        self.concurrency = concurrency
        self.users = users
        self.results = {
            "success": [],
            "failed": [],
            "error_codes": {},
        }
        self.start_time = None
        self.end_time = None

    def send_request(self, index: int) -> Tuple[int, float, int, str]:
        """Send a single login request"""
        if not self.users:
            return (index, 0.0, -1, "No users available")

        # Cycle through registered users
        user = self.users[index % len(self.users)]

        try:
            start = time.time()
            response = requests.post(
                self.endpoint,
                json={
                    "email": user["email"],
                    "password": user["password"]
                },
                timeout=10
            )
            elapsed = time.time() - start

            return (index, elapsed, response.status_code, response.text)
        except requests.exceptions.Timeout:
            return (index, 10.0, -1, "Timeout")
        except requests.exceptions.ConnectionError:
            return (index, 0.0, -1, "Connection Error")
        except Exception as e:
            return (index, 0.0, -1, str(e))

    def process_response(self, index: int, elapsed: float, status_code: int, response_text: str):
        """Process response and collect metrics"""
        is_success = status_code in [200, 201]

        result = {
            "index": index,
            "status_code": status_code,
            "response_time": elapsed,
            "success": is_success,
        }

        if is_success:
            self.results["success"].append(result)
        else:
            self.results["failed"].append(result)

            # Track error codes
            status_key = str(status_code)
            if status_key not in self.results["error_codes"]:
                self.results["error_codes"][status_key] = 0
            self.results["error_codes"][status_key] += 1

    def run(self) -> Dict:
        """Execute the login stress test"""
        print(f"\n{'='*70}")
        print(f"Login Endpoint Stress Test")
        print(f"{'='*70}")
        print(f"Endpoint:      {self.endpoint}")
        print(f"Total Requests: {self.num_requests}")
        print(f"Concurrency:   {self.concurrency}")
        print(f"Test Users:    {len(self.users)}")
        print(f"Started:       {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*70}\n")

        self.start_time = time.time()
        completed = 0

        with ThreadPoolExecutor(max_workers=self.concurrency) as executor:
            futures = {
                executor.submit(self.send_request, i): i
                for i in range(self.num_requests)
            }

            for future in as_completed(futures):
                try:
                    index, elapsed, status_code, response_text = future.result()
                    self.process_response(
                        index, elapsed, status_code, response_text)
                    completed += 1

                    progress = (completed / self.num_requests) * 100
                    bar_length = 40
                    filled = int(bar_length * completed // self.num_requests)
                    bar = f"[{'█' * filled}{' ' * (bar_length - filled)}]"
                    print(
                        f"\r{bar} {progress:.1f}% ({completed}/{self.num_requests})", end="", flush=True)
                except Exception as e:
                    print(f"\nError processing response: {e}")

        self.end_time = time.time()
        print("\n")

        return self.generate_report()

    def generate_report(self) -> Dict:
        """Generate test report with statistics"""
        total_time = self.end_time - self.start_time
        total_requests = len(
            self.results["success"]) + len(self.results["failed"])
        success_count = len(self.results["success"])
        failed_count = len(self.results["failed"])

        # Calculate response time statistics
        response_times = [r["response_time"] for r in self.results["success"]]

        stats = {
            "summary": {
                "total_requests": total_requests,
                "successful": success_count,
                "failed": failed_count,
                "success_rate": f"{(success_count / total_requests * 100):.2f}%",
                "total_duration": f"{total_time:.2f}s",
                "requests_per_second": f"{total_requests / total_time:.2f}",
            },
            "response_times": {},
            "errors": self.results["error_codes"],
        }

        if response_times:
            stats["response_times"] = {
                "min": f"{min(response_times):.3f}s",
                "max": f"{max(response_times):.3f}s",
                "mean": f"{mean(response_times):.3f}s",
                "median": f"{median(response_times):.3f}s",
            }
            if len(response_times) > 1:
                stats["response_times"]["stdev"] = f"{stdev(response_times):.3f}s"

        # Print report
        print(f"{'='*70}")
        print(f"Test Results Summary")
        print(f"{'='*70}")
        print(f"Total Requests:     {stats['summary']['total_requests']}")
        print(f"Successful:         {stats['summary']['successful']} ✓")
        print(f"Failed:             {stats['summary']['failed']} ✗")
        print(f"Success Rate:       {stats['summary']['success_rate']}")
        print(f"Total Duration:     {stats['summary']['total_duration']}")
        print(f"Requests/Second:    {stats['summary']['requests_per_second']}")

        if stats['response_times']:
            print(f"\nResponse Time Statistics (Successful Requests):")
            print(f"  Min:              {stats['response_times']['min']}")
            print(f"  Max:              {stats['response_times']['max']}")
            print(f"  Mean:             {stats['response_times']['mean']}")
            print(f"  Median:           {stats['response_times']['median']}")
            if 'stdev' in stats['response_times']:
                print(
                    f"  Std Dev:          {stats['response_times']['stdev']}")

        if stats['errors']:
            print(f"\nError Distribution:")
            for code, count in stats['errors'].items():
                print(f"  Status {code}: {count} requests")

        print(
            f"\nCompleted:          {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*70}\n")

        return stats


def main():
    parser = argparse.ArgumentParser(
        description="Stress test for login endpoint (registers users first)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python login.py --users 50 --requests 500 --concurrency 25
  python login.py -u 100 -r 1000 -c 50 --url http://localhost:3001
        """
    )

    parser.add_argument(
        "-u", "--users",
        type=int,
        default=50,
        help="Number of test users to register first (default: 50)"
    )
    parser.add_argument(
        "-r", "--requests",
        type=int,
        default=500,
        help="Number of login requests to send (default: 500)"
    )
    parser.add_argument(
        "-c", "--concurrency",
        type=int,
        default=25,
        help="Number of concurrent requests (default: 25)"
    )
    parser.add_argument(
        "--url",
        type=str,
        default="http://localhost:3001",
        help="Base URL of the API (default: http://localhost:3001)"
    )

    args = parser.parse_args()

    # Validate arguments
    if args.users < 1:
        print("Error: users must be >= 1", file=sys.stderr)
        sys.exit(1)
    if args.requests < 1:
        print("Error: requests must be >= 1", file=sys.stderr)
        sys.exit(1)
    if args.concurrency < 1:
        print("Error: concurrency must be >= 1", file=sys.stderr)
        sys.exit(1)

    try:
        # Phase 1: Register test users
        registration = RegistrationPhase(
            base_url=args.url,
            num_users=args.users,
            concurrency=args.concurrency
        )
        registered_users = registration.run()

        if not registered_users:
            print(
                "Error: No users were registered. Cannot proceed with login test.", file=sys.stderr)
            sys.exit(1)

        # Phase 2: Login stress test
        login_tester = LoginStressTest(
            base_url=args.url,
            num_requests=args.requests,
            concurrency=args.concurrency,
            users=registered_users
        )
        report = login_tester.run()

        # Save report to file
        report_file = f"login_stress_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"Report saved to: {report_file}\n")

    except KeyboardInterrupt:
        print("\n\nTest interrupted by user", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
