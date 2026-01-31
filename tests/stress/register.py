#!/usr/bin/env python3
"""
Stress test for the registration endpoint
Tests concurrent registration requests with metrics collection
"""

import requests
import time
import uuid
import json
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from statistics import mean, stdev, median
from typing import List, Dict, Tuple
from datetime import datetime
import sys


class RegistrationStressTest:
    def __init__(self, base_url: str, num_requests: int, concurrency: int):
        self.base_url = base_url
        self.endpoint = f"{base_url}/v1/auth/register"
        self.num_requests = num_requests
        self.concurrency = concurrency
        self.results = {
            "success": [],
            "failed": [],
            "error_codes": {},
        }
        self.start_time = None
        self.end_time = None

    def generate_user(self, index: int) -> Dict[str, str]:
        """Generate unique user data for each request"""
        unique_id = str(uuid.uuid4())[:8]
        return {
            "email": f"testuser-{index}-{unique_id}@stress-test.com",
            "password": f"StressPass123_{unique_id}",
            "name": f"Test User {index}"
        }

    def send_request(self, index: int) -> Tuple[int, float, int, str]:
        """Send a single registration request"""
        user_data = self.generate_user(index)

        try:
            start = time.time()
            response = requests.post(
                self.endpoint,
                json=user_data,
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
        """Execute the stress test"""
        print(f"\n{'='*70}")
        print("Registration Endpoint Stress Test")
        print(f"{'='*70}")
        print(f"Endpoint:           {self.endpoint}")
        print(f"Total Requests:     {self.num_requests}")
        print(f"Concurrency:        {self.concurrency}")
        print(
            f"Started:            {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*70}\n")

        self.start_time = time.time()
        completed = 0

        with ThreadPoolExecutor(max_workers=self.concurrency) as executor:
            # Submit all requests
            futures = {
                executor.submit(self.send_request, i): i
                for i in range(self.num_requests)
            }

            # Process responses as they complete
            for future in as_completed(futures):
                try:
                    index, elapsed, status_code, response_text = future.result()
                    self.process_response(
                        index,
                        elapsed,
                        status_code,
                        response_text
                    )
                    completed += 1

                    # Progress indicator
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
            print(f"\n{'Response Time Statistics (Successful Requests)':}")
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
        description="Stress test for registration endpoint",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python register.py --requests 100 --concurrency 10
  python register.py -r 1000 -c 50 --url http://localhost:3001
        """
    )

    parser.add_argument(
        "-r", "--requests",
        type=int,
        default=100,
        help="Number of requests to send (default: 100)"
    )
    parser.add_argument(
        "-c", "--concurrency",
        type=int,
        default=10,
        help="Number of concurrent requests (default: 10)"
    )
    parser.add_argument(
        "-u", "--url",
        type=str,
        default="http://localhost:3001",
        help="Base URL of the API (default: http://localhost:3001)"
    )

    args = parser.parse_args()

    print(f"args {args}")

    # Validate arguments
    if args.requests < 1:
        print("Error: requests must be >= 1", file=sys.stderr)
        sys.exit(1)
    if args.concurrency < 1:
        print("Error: concurrency must be >= 1", file=sys.stderr)
        sys.exit(1)

    try:
        # Run stress test
        tester = RegistrationStressTest(
            base_url=args.url,
            num_requests=args.requests,
            concurrency=args.concurrency
        )
        report = tester.run()

        # Save report to file
        report_file = f"stress_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
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
