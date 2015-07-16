#!/usr/bin/env python

import sys

from setuptools.command.sdist import sdist

try:
    from setuptools import setup, find_packages
except ImportError:
    from distutils.core import setup


install_requires = [
    'wagtail>=1.0b2',
    ]


setup(
    name='wagtailtinymce',
    version='4.2.1.0',
    description='A TinyMCE editor integration for Wagtail',
    author='Richard Mitchell',
    author_email='richard.mitchell@isotoma.com',
    url='https://github.com/isotoma/wagtailtinymce.git',
    packages=find_packages(),
    include_package_data=True,
    license='LGPL',
    long_description=open('README.rst').read(),
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: GNU Lesser General Public License v2 or later (LGPLv2+)',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Framework :: Django',
        'Topic :: Internet :: WWW/HTTP :: Site Management',
    ],
    install_requires=install_requires,
    entry_points="""
    """,
    zip_safe=False,
)
